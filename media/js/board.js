
var Flexical = function() {

    var self = this;

    var socket = io.connect();

    socket.on('connect', function(data) {
        console.log('connected');
    });
    
    socket.on('widget:update', function(data) {
        console.log(data);
    });
 
}

$(function() {
    var board = new Flexical();
});