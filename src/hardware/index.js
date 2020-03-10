const five = require('johnny-five');
const Tessel = require('tessel-io');
const { playSong, NOTES } = require('../SoundUtils');
const { nyanIntro } = require('../songs');
const { initAlarmHardware } = require('./Alarm');

let lcdScreen;

let ledReady;
let ledSet;
let ledGo;

const initHardware = ({
    buttonAlarmTogglePin,
    lcdPins,
    ledAlarmStatusPin,
    ledGoPin,
    ledReadyPin,
    ledSetPin,
    piezoPin,
    piezoPort,
}) => {
    var board = new five.Board({ io: new Tessel() });

    return new Promise(resolve => {
        board.on('ready', () => {
            log.info(
                `Device board ready. Configuring LCD display with pins ${lcdPins}...`,
            );

            lcdScreen = new five.LCD({ pins: lcdPins });

            initAlarmHardware({
                buttonAlarmToggle: new five.Button(buttonAlarmTogglePin),
                ledAlarmStatus: new five.Led(ledAlarmStatusPin),
            });

            // ledReady = new five.Led(ledReadyPin);
            // ledSet = new five.Led(ledSetPin);
            // ledGo = new five.Led(ledGoPin);

            playSong({
                piezoPin,
                piezoPort,
                song: nyanIntro,
            });

            resolve();
        });
    });
};

const updateLcdScreen = (displayLines, options) => {
    if (!lcdScreen) {
        log.error(new Error('LCD display has not been initialized'));
        return;
    }

    displayLines.forEach((line, i) => {
        lcdScreen.cursor(i, 0).print(line.padEnd(16, ' '));
    });
};

module.exports = {
    initHardware,
    updateLcdScreen,
};
