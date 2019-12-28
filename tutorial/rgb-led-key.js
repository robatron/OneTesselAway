var five = require('johnny-five');
var Tessel = require('tessel-io');
var board = new five.Board({
    io: new Tessel(),
});

board.on('ready', function() {
    var rgb = new five.Led.RGB(['a5', 'a6', 'b5']);

    var animation = new five.Animation(rgb);

    var rainbow = () => {
        animation.enqueue({
            loop: true,
            duration: 6000,
            cuePoints: [0, 0.16, 0.32, 0.5, 0.66, 0.83, 1],
            keyFrames: [
                // Any valid "color" argument can be used!
                { color: 'red' },
                [255, 99, 0],
                { color: 'ffff00' },
                { color: { red: 0x00, green: 0xff, blue: 0x00 } },
                { color: 'indigo' },
                '#4B0082',
            ],
            oncomplete: rainbow,
        });
    };
    rainbow();
});
