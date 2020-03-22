let lcdScreen;

const initLcdScreen = ({ isDeviceEnabled, lcdPins }) => {
    if (isDeviceEnabled) {
        log.info('Initializing LCD screen hardware...');

        const five = require('johnny-five');

        lcdScreen = new five.LCD({ pins: lcdPins });
    } else {
        log.info('Initializing mock LED screen hardware...');

        lcdScreen = {
            cursor: i => ({
                print: line => {
                    log.info(`Mock LCD screen print line "${i}": "${line}"`);
                },
            }),
        };
    }
};

const updateLcdScreen = displayLines => {
    if (!lcdScreen) {
        log.error(new Error('LCD display has not been initialized'));
        return;
    }

    displayLines.forEach((line, i) => {
        lcdScreen.cursor(i, 0).print(line.padEnd(16, ' '));
    });
};

module.exports = {
    initLcdScreen,
    updateLcdScreen,
};
