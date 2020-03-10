const five = require('johnny-five');
const Tessel = require('tessel-io');
const { wait } = require('../AsyncRepeatUtils');
const { playSong } = require('../SoundUtils');
const { nyanIntro } = require('../songs');
const { initAlarmHardware } = require('./Alarm');
const { initLcdScreen } = require('./LcdScreen');
const {
    initTrafficLight,
    setReadyState,
    setSteadyState,
    setGoState,
} = require('./TrafficLight');

const initHardware = ({
    buttonAlarmTogglePin,
    lcdPins,
    ledAlarmStatusPin,
    ledGoPin,
    ledReadyPin,
    ledSteadyPin,
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
            initTrafficLight({ ledReadyPin, ledSteadyPin, ledGoPin });

            // Play a tune and cycle traffic light once the hardware is ready to go
            playSong({ piezoPin, piezoPort, song: nyanIntro });

            resolve();
        });
    });
};

module.exports = {
    initHardware,
};
