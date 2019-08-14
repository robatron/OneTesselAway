var Tessel = require('tessel-io');
var five = require('johnny-five');

var board = new five.Board({
    io: new Tessel(),
});

board.on('ready', function() {
    var leds = new five.Leds(['b5', 'b6']);
    var buttons = new five.Buttons(['a5', 'a6']);

    buttons.on('press', button => {
        leds.off();
        leds[buttons.indexOf(button)].on();
    });
});
