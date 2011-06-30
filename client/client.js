function crosswordClient(room) {
  this._client = new Faye.Client("http://localhost:8001/crossword");
  this._room = '/' + room;
  console.log(this._room);
  this._subscription = this._client.subscribe(this._room, function(message) {
    console.log('Recvd ' + message.text);
  });
}

crosswordClient.prototype = {
  _client: null,
  _subscription: null,

  update: function() {
    console.log('updating to ' + this._room);
    this._client.publish(this._room, { text: "OH GOD" });
  },
};
