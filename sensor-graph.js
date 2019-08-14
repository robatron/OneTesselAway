var Barcli = require('barcli');
var five = require('johnny-five');
var Tessel = require('tessel-io');
var board = new five.Board({
    io: new Tessel(),
    repl: false,
    debug: false,
});

board.on('ready', function() {
    var range = [0, 100];
    var graph = new Barcli({
        label: 'My Data',
        range: range,
    });
    var sensor = new five.Sensor({
        pin: 'a7',
        threshold: 5, // See notes below for detailed explanation
    });

    sensor.on('change', () => {
        graph.update(sensor.scaleTo(range));
    });
});
