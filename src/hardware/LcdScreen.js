const five = require('johnny-five');

let lcdScreen;

const initLcdScreen = lcdPins => {
    lcdScreen = new five.LCD({ pins: lcdPins });
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
