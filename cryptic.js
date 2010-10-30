function loadCrosswordFromURL(url) {
  url += "&callback=loadCrossword";

  var script = document.createElement("script");
  script.src = url;
  document.head.appendChild(script);
}

var crossword;
function loadCrossword(data) {
  crossword = data;
  drawCrossword();
}

function drawCrossword() {
  try {
  var rows = crossword.size.rows;
  var cols = crossword.size.cols;

  // Create the crossword board using a table.
  var table = document.createElement("table");
  table.classList.add("puzzle-board");
  table.cellPadding = table.cellSpacing = "0";
  for (var i = 0; i < rows; i++) {
    var tr = document.createElement("tr");
    for (var j = 0; j < cols; j++) {
      var index = (i * rows) + j;
      var td = document.createElement("td");
      td.classList.add("puzzle-cell");
      tr.appendChild(td);
      var content = document.createElement("div");
      td.appendChild(content);

      var isBlank = (crossword.grid[index]) == ".";
      content.classList.add("puzzle-item");

      if (isBlank)
        td.classList.add("puzzle-blank");

      if (crossword.gridnums[index] != 0) {
        var num = crossword.gridnums[index];
        var numDiv = document.createElement("div");
        numDiv.classList.add("puzzle-num");
        numDiv.innerHTML = num;
        content.appendChild(numDiv);
      }

      var textDiv = document.createElement("div");
      textDiv.classList.add("puzzle-text");
      textDiv.innerHTML = isBlank ? "" : "A";

      content.appendChild(textDiv);
    }
    table.appendChild(tr);
  }
  //document.body.appendChild(table);

  // Now create the Clues.
  var across = crossword.clues.across;
  var down = crossword.clues.down;

  var superColumn = document.createElement("div");
  superColumn.appendChild(table);
  superColumn.classList.add("largecolumns");

  var columns = document.createElement("div");
  columns.classList.add("columns");

  superColumn.appendChild(columns);

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
      clueItem.innerHTML = text;
      cluesList.appendChild(clueItem);
    }
    return cluesList;
  };
  columns.appendChild(makeCluesList(across));
  columns.appendChild(makeCluesList(down));

  //XXX: move to using a column for each type of clue.

  //document.body.appendChild(columns);
  superColumn.appendChild(columns);
  document.body.appendChild(superColumn);

  }catch(err){alert(err);}
}

/***********************************************
 * Test data to avoid constant downloading:
 ***********************************************/
crossword = {
  "title": "NY Times, Thu, Sep 11, 2008",
  "author": "Caleb Madison",
  "editor": "Will Shortz",
  "publisher": "The New York Times",
  "date": "9/11/2008",
  "size": {
    "rows": 15,
    "cols": 15
  },
  "grid": [ "G","R","E","W",".","A","N","A","I","S",".","L","A","B","S",
            "L","A","R","A",".","N","O","STAR","C","H",".","E","B","O","N",
            "A","N","I","L",".","E","S","T","E","E",".","A","D","U","E",
            "R","A","C","K","E","T","E","E","R","S",".","D","O","L","E",
            "E","T","H","O","S",".",".",".",".",".",".",".","M","E","R",
            ".",".",".","F","A","M",".","R","A","P",".","L","I","V",".",
            "C","H","E","F",".","I","R","E","N","E",".","O","N","A","N",
            "C","O","L","A",".","L","O","STAR","T","S",".","S","A","R","S",
            "S","L","A","M",".","A","T","E","S","T",".","A","L","D","A",
            ".","L","I","E",".","N","E","A",".","O","W","N",".",".",".",
            "A","Y","N",".",".",".",".",".",".",".","A","G","A","T","E",
            "T","W","E","E",".","V","A","M","P","I","R","E","B","A","T",
            "T","O","M","A",".","E","D","U","C","T",".","L","A","S","H",
            "H","O","A","R",".","R","E","STAR","T","S",".","E","T","T","A",
            "E","D","Y","S",".","A","N","D","S","O",".","S","E","E","N" ],
  "gridnums": [ 1,2,3,4,0,5,6,7,8,9,0,10,11,12,13,
                14,0,0,0,0,15,0,0,0,0,0,16,0,0,0,
                17,0,0,0,0,18,0,0,0,0,0,19,0,0,0,
                20,0,0,0,21,0,0,0,0,0,0,22,0,0,0,
                23,0,0,0,0,0,0,0,0,0,0,0,24,0,0,
                0,0,0,25,0,26,0,27,28,29,0,30,0,0,0,
                31,32,33,0,0,34,35,0,0,0,0,36,0,0,37,
                38,0,0,0,0,39,0,0,0,0,0,40,0,0,0,
                41,0,0,0,0,42,0,0,0,0,0,43,0,0,0,
                0,44,0,0,0,45,0,0,0,46,47,0,0,0,0,
                48,0,0,0,0,0,0,0,0,0,49,0,50,51,52,
                53,0,0,54,0,55,56,57,58,59,0,0,0,0,0,
                60,0,0,0,0,61,0,0,0,0,0,62,0,0,0,
                63,0,0,0,0,64,0,0,0,0,0,65,0,0,0,
                66,0,0,0,0,67,0,0,0,0,0,68,0,0,0 ],
  "circles": [ 0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,
               0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
               0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
               0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,
               0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
               0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
               0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
               0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
               0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
               0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
               0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
               0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,
               0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
               0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
               0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
  "clues": {
    "across": [ "1. Waxed", "5. First name in erotica", "10. They might be chocolate", "14. ___ Flynn Boyle of \"Twin Peaks\"", "15. Request at a laundry", "16. Like some keys", "17. Dye plant", "18. Popular women's fragrance", "19. Together, in music", "20. Makes people offers they can't refuse?", "22. Apportionment", "23. Set of values", "24. View from Marseille", "25. Relatives, slangily", "27. You might end up with a bum one", "30. Actress Tyler", "31. Child, for one", "34. Adler who outwitted Sherlock Holmes", "36. ___ impulse", "38. ___ + grenadine + maraschino cherry = Roy Rogers cocktail", "39. Illumination of manuscripts, and others", "40. Headline-making illness of 2002-03", "41. Dis", "42. Mushroom maker, for short", "43. Tony nominee for \"Glengarry Glen Ross\"", "44. Interrogator's discovery", "45. Cultural org.", "46. Retain", "48. Rand who created Dagny Taggart", "49. Striped quartz", "53. ___ pop, music genre since the 1980s", "55. Nocturnal bloodsucker", "60. Tony Musante TV series", "61. Extracted chemical", "62. Punishment unit", "63. Frost", "64. Options during computer woes", "65. James of jazz", "66. Competitor of Ben & Jerry's", "67. \"Thus ...\"", "68. Spotted" ],
    "down": [ "1. Ruiner of many a photo", "2. Charged", "3. Filmmaker Von Stroheim", "4. Theme of this puzzle", "5. Without ___ (riskily)", "6. It may be wrinkled", "7. Ancient Semitic fertility goddess", "8. Bakery employee", "9. Elvis Presley's \"___ Not You\"", "10. Detective's need", "11. Like some six-packs", "12. See 32-Down", "13. Vile smile", "21. That, to Tomás", "26. Home of \"The Last Supper\"", "27. Place for picnicking and dog-walking", "28. Hill dwellers", "29. ___ alla genovese (sauce)", "30. City where 32- and 12-Down is found", "31. Also sends to, as an e-mail", "32. With 12-Down, locale of the 4-Down", "33. \"Ishtar\" director", "35. You might give a speech by this", "37. Ultrasecret org.", "47. \"That mad game the world so loves to play,\" to Jonathan Swift", "48. ___ ready", "50. Peter out", "51. It's often unaccounted for", "52. Allen in American history", "54. All ___", "55. Lynn who sang \"We'll Meet Again\"", "56. Port near the Red Sea", "57. Yellow squirt?", "58. Pie chart figs.", "59. \"Wishing won't make ___\"" ]
  },
  "answers": {
    "across": [ "GREW", "ANAIS", "LABS", "LARA", "NOSTARCH", "EBON", "ANIL", "ESTEE", "ADUE", "RACKETEERS", "DOLE", "ETHOS", "MER", "FAM", "RAP", "LIV", "CHEF", "IRENE", "ONAN", "COLA", "LOSTARTS", "SARS", "SLAM", "ATEST", "ALDA", "LIE", "NEA", "OWN", "AYN", "AGATE", "TWEE", "VAMPIREBAT", "TOMA", "EDUCT", "LASH", "HOAR", "RESTARTS", "ETTA", "EDYS", "ANDSO", "SEEN" ],
    "down": [ "GLARE", "RANAT", "ERICH", "WALKOFFAME", "ANET", "NOSE", "ASTARTE", "ICER", "SHES", "LEAD", "ABDOMINAL", "BOULEVARD", "SNEER", "ESA", "MILAN", "RESTAREA", "ANTS", "PESTO", "LOSANGELES", "CCS", "HOLLYWOOD", "ELAINEMAY", "ROTE", "NSA", "WAR", "ATTHE", "ABATE", "TASTE", "ETHAN", "EARS", "VERA", "ADEN", "MUSTARD", "PCTS", "ITSO" ]
  },
  "notepad": "TEEN PUZZLEMAKER WEEK<br />All the daily crosswords this week, Monday through Saturday, have been contributed by puzzlemakers under the age of 20. Today's crossword is by Caleb Madison, 15, of New York City. He is a sophomore at Bard High School in Manhattan. This is his fourth puzzle for The Times.<br /><br />When this puzzle is done, connect the circled letters in alphabetical order, and then back to the start, to reveal something seen on the 32-Down 4-Down.",
  "copyright": "2008, The New York Times"
};
window.addEventListener("load", drawCrossword, false);
