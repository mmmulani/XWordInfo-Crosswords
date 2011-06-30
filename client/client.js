function crosswordClient(room, updateCallback) {
  this._client = new Faye.Client("http://localhost:8001/crossword");
  this._room = '/' + room;
  this._timer = null;
  this._updateCallback = updateCallback;

  var self = this;
  this._subscription = this._client.subscribe(
    this._room, 
    function(message) {
      self._updateCallback(message.progress);
    });
}

crosswordClient.prototype = {
  _client: null,
  _progress: null,
  _subscription: null,
  _timer: null,
  _updateCallback: null,

  update: function(progress) {
    console.log('updating to ' + this._room);
    var self = this;
    this._progress = progress;

    if (this._timer) {
      return;
    }

    this._timer = setTimeout(function() {
      self._timer = null;
      self._client.publish(
        self._room, 
        { command: "update", progress: self._progress }
      );
    }, 1000); 
  },
};
