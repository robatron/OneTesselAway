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

    var index = 0;
    var rainbow = [
        'white',
        'black',
        'red',
        'orange',
        'yellow',
        'green',
        'blue',
        'indigo',
        'violet',
    ];

    board.loop(250, () => {
        led.color(rainbow[index]);
        index = index + 1;
        if (index === rainbow.length) {
            index = 0;
        }
    });
});
