var http = require('http'),
    faye = require('faye'),
    PORT = 8008;

// Can access the "current" puzzle at |crosswords.puzzle|.
var crosswords = require("./puzzle.js");

var bayeux = new faye.NodeAdapter({
  mount: '/crossword',
  timeout: 45,
});

// mergeProgress: takes two arrays of strings and copies all entries from |arrB|
// into |arrA| where they do not exist. Defaults to |arrA| for most choices.
function mergeProgress(progA, progB) {
  if (progA.length != progB.length)
    return progA;

  var toRet = progA.slice();
  for (var i = 0; i < progA.length; i++) {
    if ((progB[i]) && !(progA[i]))
      toRet[i] = progB[i];
  }
  return toRet;
}

var mergeCrosswordData = {
  incoming: function(message, callback) {
    console.log(message);
    if (message.channel != "/room1")
      return callback(message);

    var oldProgress = message.data.progress;
    var newProgress = mergeProgress(crosswords.puzzle.progress, oldProgress);
    newProgress = newProgress.map(function(x,i) {
      return crosswords.puzzle.grid[i] == x ? x : '';
    });
    crosswords.puzzle.progress = newProgress;
    message.data.progress = newProgress;
    callback(message);
  },
};
bayeux.addExtension(mergeCrosswordData);

var client = bayeux.getClient();
client.subscribe("/room1", function(message) {
  console.log("Received message: " + message.command);
});

var server = http.createServer(function(request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.write('Hello, non-Bayeux request');
  response.end();
});

bayeux.attach(server);
server.listen(PORT);
