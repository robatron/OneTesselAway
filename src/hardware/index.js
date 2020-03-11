const five = require('johnny-five');
const Tessel = require('tessel-io');
const { playSong } = require('../SoundUtils');
const { nyanIntro } = require('../songs');
const { initAlarmHardware } = require('./Alarm');
const { initDebugHardware } = require('./Debug');
const { initLcdScreen } = require('./LcdScreen');
const { initTrafficLight, setTrafficLightState } = require('./TrafficLight');

const initHardware = ({
    buttonAlarmTogglePin,
    buttonDebugForceGoStatePin,
    lcdPins,
    ledAlarmStatusPin,
    ledMissPin,
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

            // Debug hardware
            initDebugHardware({ buttonDebugForceGoStatePin });

            // Alarm button, buzzer, and light
            initAlarmHardware({ buttonAlarmTogglePin, ledAlarmStatusPin });

            // Traffic light: Set of 3 LEDs
            initTrafficLight({ ledReadyPin, ledSteadyPin, ledMissPin });

            // Init LCD last b/c it's slow
            initLcdScreen(lcdPins);

            // Play a tune and flash traffic light once the hardware is ready to go
            playSong({ piezoPin, piezoPort, song: nyanIntro });
            setTrafficLightState('go');

            resolve();
        });
    });
};

module.exports = {
    initHardware,
};
