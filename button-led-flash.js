var Tessel = require('tessel-io');
var five = require('johnny-five');

var board = new five.Board({
    io: new Tessel(),
});

board.on('ready', function() {
    var led = new five.Led('a5');
    var button = new five.Button('a2');
    button.on('press', () => led.on());
    button.on('hold', () => led.blink(500));
    button.on('release', () => led.stop().off());
});
