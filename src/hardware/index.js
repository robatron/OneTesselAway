const five = require('johnny-five');
const Tessel = require('tessel-io');
const { playSong } = require('../SoundUtils');
const { nyanIntro } = require('../songs');
const { initAlarmHardware } = require('./Alarm');
const { initLcdScreen } = require('./LcdScreen');
const { initTrafficLight } = require('./TrafficLight');

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

            initLcdScreen(lcdPins);
            initAlarmHardware({ buttonAlarmTogglePin, ledAlarmStatusPin });
            initTrafficLight({ ledReadyPin, ledSetPin, ledGoPin });

            // ledReady = new five.Led(ledReadyPin);
            // ledSet = new five.Led(ledSetPin);
            // ledGo = new five.Led(ledGoPin);

            // Play a tune once the hardware is ready to go
            playSong({ piezoPin, piezoPort, song: nyanIntro });

            resolve();
        });
    });
};

module.exports = {
    initHardware,
};
