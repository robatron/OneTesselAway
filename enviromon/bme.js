var Tessel = require('tessel-io');
var five = require('johnny-five');
var board = new five.Board({
    io: new Tessel(),
});

board.on('ready', () => {
    var monitor = new five.Multi({
        controller: 'BME280',
    });

    monitor.on('change', function() {
        console.log('thermometer');
        console.log('  celsius      : ', this.thermometer.celsius);
        console.log('  fahrenheit   : ', this.thermometer.fahrenheit);
        console.log('  kelvin       : ', this.thermometer.kelvin);
        console.log('--------------------------------------');

        console.log('barometer');
        console.log('  pressure     : ', this.barometer.pressure);
        console.log('--------------------------------------');

        console.log('altimeter');
        console.log('  feet         : ', this.altimeter.feet);
        console.log('  meters       : ', this.altimeter.meters);
        console.log('--------------------------------------');
    });
});
