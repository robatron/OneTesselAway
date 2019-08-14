var five = require('johnny-five');
var Tessel = require('tessel-io');
var board = new five.Board({
    io: new Tessel(),
});

board.on('ready', function() {
    var sensor = new five.Sensor({
        pin: 'a7',
        threshold: 10,
    });
    var led = new five.Led('b5');

    sensor.on('change', () => {
        led.blink(sensor.scaleTo(1, 500));
    });
});
