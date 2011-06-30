var http = require('http'),
    faye = require('faye'),
    PORT = 8001;

// Can access the "current" puzzle at |crosswords.puzzle|.
var crosswords = require("./puzzle.js");

var bayeux = new faye.NodeAdapter({
  mount:   '/crossword',
  timeout: 45,
});

var client = bayeux.getClient();
client.subscribe("/room1", function(message) {
  console.log("Received message: " + message.text);
});

var server = http.createServer(function(request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.write('Hello, non-Bayeux request');
  response.end();
});

bayeux.attach(server);
server.listen(PORT);
