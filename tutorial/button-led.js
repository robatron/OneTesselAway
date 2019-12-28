var Tessel = require('tessel-io');
var five = require('johnny-five');

var board = new five.Board({
    io: new Tessel(),
});

board.on('ready', function() {
    var led = new five.Led('a5');
    var button = new five.Button('a2');
    button.on('press', () => led.on());
    button.on('release', () => led.off());
});
