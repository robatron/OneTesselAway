var Tessel = require('tessel-io');
var five = require('johnny-five');

var board = new five.Board({
    io: new Tessel(),
});

board.on('ready', () => {
    var led = new five.Led.RGB({
        pins: {
            red: 'a5',
            green: 'a6',
            blue: 'b5',
        },
    });

    var red = 0;
    var green = 0;
    var blue = 0;

    board.loop(1, () => {
        board.loop(1, () => {
            board.loop(1, () => {
                led.color([red, green, blue]);

                ++blue;
                if (blue === 255) {
                    blue = 0;
                }
            });
            ++green;
            if (green === 255) {
                green = 0;
            }
        });
        ++red;
        if (red === 255) {
            red = 0;
        }
    });
});
