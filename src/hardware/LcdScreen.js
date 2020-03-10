let lcdScreen;

const initLcdScreen = lcd => {
    lcdScreen = lcd;
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
    updateLcdScreen,
};
