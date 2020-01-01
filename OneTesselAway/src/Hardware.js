var five = require('johnny-five');
var Tessel = require('tessel-io');

let lcdScreenUpdateCount = 0;
let lcdScreen;

const initHardware = lcdPins => {
    var board = new five.Board({ io: new Tessel() });

    return new Promise(resolve => {
        board.on('ready', () => {
            log.info(
                `Device board ready. Configuring LCD display with pins ${lcdPins}...`,
            );
            lcdScreen = new five.LCD({ pins: lcdPins });
            resolve();
        });
    });
};

const updateLcdScreen = (displayLines, options) => {
    if (!lcdScreen) {
        log.error(new Error('LCD display has not been initialized'));
        return;
    }
    log.info(`Updating display lines with ${displayLines}...`);

    // Should we flash any characters? If so, which ones, and how?
    let { flash, flashAlt, flashBlankChar, flashChar } = options || {};
    if (flash) {
        flashBlankChar = flashBlankChar || ' ';
        flashChar = flashChar || ':';

        displayLines.forEach((line, i) => {
            const flashCharIndex = line.indexOf(flashChar);
            if (flashCharIndex > -1) {
                displayLines[i][flashCharIndex] = flashBlankChar;
            }
        });
    }

    displayLines.forEach((line, i) => {
        lcdScreen.cursor(i, 0).print(line.padEnd(16, ' '));
    });

    ++lcdScreenUpdateCount;
};

module.exports = {
    initHardware,
    updateLcdScreen,
};
