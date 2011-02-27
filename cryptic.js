'use strict';

function initCrossword() {
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
 * progress: array of size rows*cols. Each element is a space character
 *    indicating no progress or a string (does not have to match grid).
 *    This is an added property and not found in XWordInfo crosswords.
 */
var crossword;
function loadCrossword(data) {
  addCrossword(data);
  crossword = data;
  drawCrossword();
}

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

const HTML5_CROSSWORD_STORE = "cryptic_crosswords";

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
      textDiv.innerHTML = isBlank ? "" :
             (Math.floor(10 + (Math.random() * 26))).toString(36).toUpperCase();

      content.appendChild(textDiv);
    }
    table.appendChild(tr);
  }
  table._player = new crosswordPlayer(table, crossword);
  table._player.activate(0, true);

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
    clueItem.textContent = text;
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
}
crosswordPlayer.prototype = {
  // This is the HTML table element corresponding to the board.
  _board: null,

  // Crossword object as defined earlier.
  _crossword: null,

  // This is the HTML table cell that was last active.
  _lastActive: null,
  _getCellAt: function(index) {
    var row = this._board.childNodes[~~(index / this._crossword.size.cols)];
    return !row ? undefined : row.childNodes[index % this._crossword.size.cols];
  },
  activate: function(index, horiz) {
    if (this._lastActive)
      this._lastActive.removeAttribute("active");

    var cell = this._getCellAt(index);
    this._lastActive = cell;
    if (!cell)
      return;

    // Now we get the indices for the word.
    var jumpAmount = horiz ? this._crossword.size.cols : 1;
    var indices = [];
    for (var i = index; (i >= 0) && (this._crossword.grid[i] != ".");
          i -= jumpAmount)
      indices.unshift(i);
    for (var i = (index + jumpAmount); (i < this._crossword.grid.length) &&
                             (this._crossword.grid[i] != "."); i += jumpAmount)
      indices.push(i);

    var self = this;
    indices.map(function(x) {
      self._getCellAt(x).setAttribute("active", "close");
    });

    cell.setAttribute("active", "selected");
  },
};

// Event listeners
window.addEventListener("load", initCrossword, false);
window.addEventListener("unload", quitCrossword, false);
