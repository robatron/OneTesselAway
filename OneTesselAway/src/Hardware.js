var five = require('johnny-five');
var Tessel = require('tessel-io');

const initHardware = (updateInterval, lcdPins, getDisplayLinesFn) => {
    var board = new five.Board({ io: new Tessel() });

    board.on('ready', () => {
        log.info(
            `Device board ready. Configuring LCD display with pins ${lcdPins}...`,
        );
        const lcd = new five.LCD({
            pins: lcdPins,
        });

        board.loop(updateInterval, () => {
            log.info(
                `LCD display updating. Will update again in ${updateInterval} seconds.`,
            );
            const displayLines = getDisplayLinesFn();
            displayLines.forEach((line, i) => {
                lcd.cursor(i, 0).print(line.padEnd(16, ' '));
            });
        });
    });
};

module.exports = {
    initHardware,
};
