var Tessel = require('tessel-io');
var five = require('johnny-five');

var board = new five.Board({
    io: new Tessel(),
});

board.on('ready', () => {
    var button = new five.Button('a2');
    button.on('press', () => console.log('Button Pressed!'));
    button.on('release', () => console.log('Button Released!'));
});
