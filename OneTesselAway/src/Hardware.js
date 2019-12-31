var five = require('johnny-five');
var Tessel = require('tessel-io');

const initHardware = lcdPins => {
    var board = new five.Board({ io: new Tessel() });

    return new Promise(resolve => {
        board.on('ready', () => {
            log.info(
                `Device board ready. Configuring LCD display with pins ${lcdPins}...`,
            );
            const lcd = new five.LCD({ pins: lcdPins });

            resolve(displayLines => {
                log.info(`Updating display lines with ${displayLines}...`);

                displayLines.forEach((line, i) => {
                    lcd.cursor(i, 0).print(line.padEnd(16, ' '));
                });
            });
        });
    });
};

module.exports = {
    initHardware,
};
