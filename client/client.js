var client = new Faye.Client("http://localhost:8001/crossword");

var subscription = client.subscribe("/room1", function(message) {
  alert(message.text);
});
subscription.callback(function() {
  alert("Subscription is now active!");
  client.publish("/room1", { text: "Test message" });
});
