'use strict';

function initCrossword() {
  entryBox = document.getElementById("crosswordEntry");

  loadCrosswordsFromStorage();

  if (crosswordCount > 0) {
    // Randomly chooses a crossword to display.
    do {
      var date = randomProperty(crosswords);
    } while (crosswords[date].length <= 0);
    var index = Math.floor(crosswords[date].length * Math.random());
    crossword = crosswords[date][index];
    drawCrossword();
  }
}

function quitCrossword() {
  saveCrosswordsToStorage();
}

function loadCrosswordFromURL(url) {
  url += "&callback=loadCrossword";

  var script = document.createElement("script");
  script.src = url;
  document.head.appendChild(script);
}

/* crossword properties:
 * title, author, editor, publisher, date, notepad, copyright: strings.
 * size: object with numeric rows and cols property.
 * grid: array of size rows*cols. Each element is a letter or fill-in.
         If a space is not filled, it is a "." character.
 * gridnums: array of size rows*cols. Each element is a number corresponding
             to the number meant to be in display. If no number is meant to be
             displayed, a 0 is used.
 * circles: array of size rows*cols. Each element is 0 or 1.
 * clues: object with across and down arrays.
 * answers: object with across and down arrays, same order as clues.
 *
 * progress: array of size rows*cols. Each element is the empty string
 *    indicating no progress or a string (does not have to match grid).
 *    This is an added property and not found in XWordInfo crosswords.
 */
var crossword;
function loadCrossword(data) {
  addCrossword(data);
  crossword = data;
  drawCrossword();
}

// entryBox: an input box that the user interacts with in order to play the
//           crossword. An event listener is added by the crosswordPlayer object.
var entryBox;

// crosswords: hash of dates, each date is an array of crosswords.
var crosswords = {};
var crosswordCount = 0;

// If entries conflict, takes the value from progA.
// TODO: Return value of how many characters were merged.
// 0 => added without merge. N > 0 => added with N characters merged.
// Z < 0 => was unable to add due to some error.
function mergeProgress(progA, progB) {
  if (!(progB instanceof Array))
    return progA;
  if (!(progA instanceof Array))
    return progB;

  if (progA.length != progB.length)
    return progA;

  var toRet = progA.slice();
  for (var i = 0; i < progA.length; i++) {
    if (progB[i] != " " && progA[i] == " ")
      toRet[i] = progB[i];
  }

  return toRet;
}

// addCrossword can be slow, but should be fast enough for <300 entries.
// Crosswords are not validated before-hand, which could break with
// versioning.
function addCrossword(crossword) {
  // First check if we already have the crossword, and if so, merge the
  // entries.
  if (crossword.date in crosswords) {
    var mergeArr = crosswords[crossword.date];
    for (var oldCrossword in mergeArr) {
      oldCrossword = mergeArr[oldCrossword];

      // Lossily check if the two crosswords are the same.
      if (oldCrossword.grid.join("") == crossword.grid.join("")) {
        var newProgress = mergeProgress(oldCrossword.progress,
                                        crossword.progress);
        oldCrossword.progress = crossword.progress;
        return;
      }
    }
    mergeArr.push(crossword);
    crosswordCount++;
    return;
  }

  crosswords[crossword.date] = [crossword];
  crosswordCount++;
}

var HTML5_CROSSWORD_STORE = "cryptic_crosswords";

// loadCrosswordsFromStorage: Load crosswords into crosswords array using
// HTML5 local storage. This operation should merge the crosswords from
// storage with the currently loaded ones.
function loadCrosswordsFromStorage() {
  // TODO: Display this information to the user.
  // Check for lacking support.
  if (typeof(localStorage) == "undefined")
    return;

  var newCrosswords = JSON.parse(localStorage.getItem(HTML5_CROSSWORD_STORE));
  for (var dateArr in newCrosswords)
    newCrosswords[dateArr].forEach(addCrossword);
}

// saveCrosswordsToStorage: Complement to loadCFS, assumes that the
// previously stored crosswords have been loading before making this call.
// XXX: This would likely break with multiple instances of the app open.
function saveCrosswordsToStorage() {
  if (typeof(localStorage) == "undefined")
    return;

  var jsonCrosswords = JSON.stringify(crosswords);

  localStorage.setItem(HTML5_CROSSWORD_STORE, jsonCrosswords);
}

// drawCrossword: Present the current crossword on the page
// in pure HTML.
function drawCrossword() {
  var rows = crossword.size.rows;
  var cols = crossword.size.cols;

  // Create the crossword board using a table.
  var table = document.createElement("table");
  table.className += "puzzle-board ";
  table.cellPadding = table.cellSpacing = "0";
  for (var i = 0; i < rows; i++) {
    var tr = document.createElement("tr");
    for (var j = 0; j < cols; j++) {
      var index = (i * rows) + j;
      var td = document.createElement("td");
      td.className += "puzzle-cell ";

      var isBlank = (crossword.grid[index]) == ".";
      td.setAttribute("blank", isBlank);

      tr.appendChild(td);

      var content = document.createElement("div");
      content.className += "puzzle-item ";

      td.appendChild(content);

      if (crossword.gridnums[index] != 0) {
        var num = crossword.gridnums[index];
        var numDiv = document.createElement("div");
        numDiv.className += "puzzle-num ";
        numDiv.innerHTML = num;
        content.appendChild(numDiv);
      }

      var textDiv = document.createElement("div");
      textDiv.className += "puzzle-text ";

      content.appendChild(textDiv);
    }
    table.appendChild(tr);
  }
  table._player = new crosswordPlayer(table, crossword);
  var randomSpot;
  do {
    randomSpot = Math.floor(Math.random() * crossword.grid.length);
  } while (crossword.grid[randomSpot] == ".");
  table._player.activate(randomSpot, Math.random() > 0.5);

  // Now create the Clues.
  var across = crossword.clues.across;
  var acrossList = makeCluesList(across);
  var down = crossword.clues.down;
  var downList = makeCluesList(down);

  // Horizontally arrange the board and clues.
  var horizList = document.createElement("ul");
  horizList.style.listStyleType = "none";

  var listItems = [table, acrossList, downList];
  for (var i = 0; i < listItems.length; i++) {
    var item = listItems[i];

    var newDiv = document.createElement("div");
    newDiv.appendChild(item);
    newDiv.style.float = "left";

    var listItem = document.createElement("li");
    listItem.appendChild(newDiv);
    horizList.appendChild(listItem);
  }

  document.body.appendChild(horizList);
}

// The passed in |clues| is of the form ["1. Clue", "3. Clue", etc.].
function makeCluesList(clues) {
  var cluesList = document.createElement("ol");
  for (var i = 0; i < clues.length; i++) {
    var clueItem = document.createElement("li");
    var text = clues[i];
    // Tries to split up the clue into two parts:
    // 12. Like some keys
    // ^   ^-- clue text
    // --- number
    var matches = text.match(/^(\d*)\.\s*(.*)/);
    if (matches) {
      clueItem.value = matches[1];
      text = matches[2];
    }
    // XXX: We should replace the escaped HTML entities in |text| but for now
    // we just use innerHTML.
    clueItem.innerHTML = text;
    cluesList.appendChild(clueItem);
  }
  return cluesList;
}

function randomProperty(obj) {
  var i = 1, prop;
  for (var newProp in obj) {
    if (Math.random() * i < 1)
      prop = newProp;
    i++;
  }

  return prop;
}

function crosswordPlayer(board, crossword) {
  this._board = board;
  this._crossword = crossword;
  this._room = 'room1';

  this.init();
}
crosswordPlayer.prototype = {
  // This is the HTML table element corresponding to the board.
  _board: null,

  // Crossword client to send messages.
  _client: null,

  // The room this player will be sending messages to 
  _room: null,

  // Crossword object as defined earlier.
  _crossword: null,

  // _lastActive has an |index| and |direction| property of the last active
  // item. |direction| is vertical iff it is truthy.
  _lastActive: null,
  _getCellAt: function(index) {
    var row = this._board.childNodes[~~(index / this._crossword.size.cols)];
    return !row ? undefined : row.childNodes[index % this._crossword.size.cols];
  },

  _getCellTextNode: function(index) {
    return this
      ._getCellAt(index)
      .getElementsByClassName('puzzle-item')[0]
      .getElementsByClassName('puzzle-text')[0];
  },

  // This returns an array of indices corresponding to the word at |index|.
  _getIndices: function(index, vert) {
    var jumpAmount = vert ? this._crossword.size.cols : 1;
    var indices = [];
    var start = vert ? 0 :
              this._crossword.size.cols * ~~(index / this._crossword.size.cols);
    var end = vert ? this._crossword.grid.length : start + this._crossword.size.cols;
    for (var i = index;
         (i >= start) && (this._crossword.grid[i] != ".");
         i -= jumpAmount)
      indices.unshift(i);
    for (var i = (index + jumpAmount);
         (i < end) && (this._crossword.grid[i] != ".");
         i += jumpAmount)
      indices.push(i);

    return indices;
  },

  _setCellText: function(index, value, correct) {
    var textNode = this._getCellTextNode(index);
    textNode.parentNode.setAttribute("correct", correct);
    textNode.innerHTML = value;
  },

  // fillInLetter: This should be the main interface for inputting answers
  // onto the crossword board. An empty string for |value| should be used to
  // erase a letter. |value| can be a lower or upper case character.
  fillInLetter: function(index, value, fromUpdate) {
    value = value.toUpperCase();
    if (value.length > 1)
      value = value[0];

    // Make sure that |value| is either a alphabet letter or blank.
    if (!((value == "") || ("A" <= value && value <= "Z")))
      return;

    // Make sure the spot is meant to be filled in (not a black square).
    if (this._crossword.grid[index] == ".")
      return;

    var correct = this._crossword.grid[index].toUpperCase() == value;
    if (correct)
      this._crossword.progress[index] = value;

    this._setCellText(index, value, correct);

    if (!fromUpdate) {
      this._client.update(this._crossword.progress);
    }
  },

  update: function(progress) {
    for (var i = 0; i < progress.length; i++) {
      if (progress[i]) {
        this.fillInLetter(i, progress[i], true);
      } 
    }
  },

  init: function() {
    var self = this;

    // Make sure our |_crossword| has the additional properties not found in
    // XWordInfo crosswords.
    if (typeof(this._crossword.progress) == "undefined")
      this._crossword.progress =
        new Array(this._crossword.grid.length + 1).join(" ").split(" ");

    this._board.addEventListener("click", function(event) {
      self.onBoardClick(event);
    }, false);

    if (entryBox._lastListener)
      entryBox.removeEventListener("keydown", entryBox._lastListener, false);
    var keyListener = function(event) {
      self.onKeyDown(event);
    };
    entryBox.addEventListener("keydown", keyListener, false);
    entryBox._lastListener = keyListener;
    entryBox.focus();

    // Reload the progress from the saved crossword.
    this._crossword.progress.map(function(x, index) {
      if ((typeof(x) != "undefined") && !!x)
        self.fillInLetter(index, x, true);
    });

    this._client = new crosswordClient(this._room, this.update.bind(this));
  },

  // This focuses the crossword at |index|, in direction |vert| and allows
  // input there.
  activate: function(index, vert) {
    var self = this;

    if (arguments.length < 2)
      vert = this._lastActive.direction;

    // This case can happen when |index| is a black square.
    if (this._crossword.grid[index] == ".")
      return;

    if (this._lastActive) {
      var indices = this._getIndices(this._lastActive.index,
                                     this._lastActive.direction);
      indices.map(function (x) {
        self._getCellAt(x).removeAttribute("active");
      });
    }

    var cell = this._getCellAt(index);
    if (!cell)
      return;

    var indices = this._getIndices(index, vert);
    indices.map(function(x) {
      self._getCellAt(x).setAttribute("active", "close");
    });

    cell.setAttribute("active", "selected");

    this._lastActive = { index: index, direction: vert };
  },

  onBoardClick: function(event) {
    event.stopPropagation();

    entryBox.focus();

    var cell;
    // The click might have been on an element inside the table cell, so we
    // normalize it to the cell.
    for (cell = event.target; cell; cell = cell.parentNode) {
      if (cell.localName == "td" && cell.parentNode &&
          cell.parentNode.parentNode == this._board)
        break;
    }

    if (!cell)
      return;

    var column = Array.prototype.indexOf.call(cell.parentNode.childNodes, cell);
    var row = Array.prototype.indexOf.call(cell.parentNode.parentNode.childNodes,
                                           cell.parentNode);
    var index = (row * this._crossword.size.cols) + column;

    // We change the direction of the shown clue if the user clicks on the
    // selected cell. Otherwise, we move to the cell clicked and maintain the
    // direction.
    var direction = false;
    if (this._lastActive)
      direction = (this._lastActive.index == index) ^ this._lastActive.direction;
    this.activate(index, direction);
  },

  onKeyDown: function(event) {
    if (!this._lastActive)
      return;
    // XXX: This is to avoid some oddities on Mac when entering accent
    //      characters with the alt key.
    if (event.altKey)
      event.preventDefault();

    var index = this._lastActive.index;
    if (!event.ctrlKey && !event.metaKey) {
      var handled = true;
      switch (event.keyCode) {
        // Delete key.
        case 46:
          this.fillInLetter(index, '');
          break;

        // Backspace key.
        case 8:
          this.fillInLetter(index, '');
          this.moveBackward(index)
          break;

        // Space key.
        case 32:
          this.activate(index, !this._lastActive.direction);
          break;

        // Left key.
        case 37:
          this.moveLeft(index);
          break;
        // Right key.
        case 39:
          this.moveRight(index);
          break;

        // Up key.
        case 38:
          this.moveUp(index);
          break;
        // Down key.
        case 40:
          this.moveDown(index);
          break;

        default:
          handled = false;
          break;
      }

      if (handled) {
        event.preventDefault();
        return;
      }

      // Display the character on the screen at the current highlighted spot.
      this.fillInLetter(index, String.fromCharCode(event.keyCode));
      this.moveForward(index);
    }
  },

  // move[Forward,Backward]: Move the cursor forward/backward based on the
  // current direction and stop at the word boundary.
  moveForward: function(index) {
    this._moveWithinWord(index, this._lastActive.direction, 1);
  },
  moveBackward: function(index) {
    this._moveWithinWord(index, this._lastActive.direction, -1);
  },

  // _moveWithinWord: Moves focus |dist| away from |index| within the boundaries
  // of the word at |index| in |direction|.
  _moveWithinWord: function(index, direction, dist) {
    var indices = this._getIndices(index, direction);

    var nextIndex = indices[indices.indexOf(index) + dist];
    if (typeof(nextIndex) != "undefined")
      this.activate(nextIndex);
  },

  // The move[Left,Right,Up,Down] functions each take the index from which
  // they will move.
  moveLeft: function(index) {
    var start = this._crossword.size.cols * ~~(index / this._crossword.size.cols);
    var i;
    for (i = index - 1; i >= start && this._crossword.grid[i] == "."; i--);

    index = i < start ? index : i;

    this.activate(index, this._lastActive.direction);
  },
  moveRight: function(index) {
    var end = this._crossword.size.cols * ~~(1 + index / this._crossword.size.cols);
    var i;
    for (i = index + 1; i < end && this._crossword.grid[i] == "."; i++);

    index = i >= end ? index : i;

    this.activate(index, this._lastActive.direction);
  },
  moveUp: function(index) {
    var i;
    var width = this._crossword.size.cols;
    for (i = index - width; i >= 0 && this._crossword.grid[i] == "."; i -= width);

    index = i < 0 ? index : i;

    this.activate(index, this._lastActive.direction);
  },
  moveDown: function(index) {
    var i;
    var width = this._crossword.size.cols;
    for (i = index + width; i < this._crossword.grid.length &&
                            this._crossword.grid[i] == "."; i += width);

    index = i >= this._crossword.grid.length ? index : i;

    this.activate(index, this._lastActive.direction);
  },
};

// Event listeners
window.addEventListener("load", initCrossword, false);
window.addEventListener("unload", quitCrossword, false);
