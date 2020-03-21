const { playSong } = require('../audio/SoundUtils');
const { nyanIntro } = require('../audio/songs');
const { initAlarmHardware } = require('./Alarm');
// const { initLcdScreen } = require('./LcdScreen');
// const { initTrafficLight, setTrafficLightState } = require('./TrafficLight');

const initHardware = ({
    buttonAlarmTogglePin,
    isDeviceEnabled,
    lcdPins,
    ledAlarmStatusPin,
    ledMissPin,
    ledReadyPin,
    ledSteadyPin,
    piezoPin,
    piezoPort,
}) => {
    let board;

    if (isDeviceEnabled) {
        log.info('Initializing hardware...');

        const five = require('johnny-five');
        const Tessel = require('tessel-io');

        board = new five.Board({ io: new Tessel() });
    } else {
        log.info('Initializing mock hardware...');

        board = {
            on: (event, cb) => cb(),
        };
    }

    return new Promise(resolve => {
        board.on('ready', () => {
            log.info(
                `Device board ready. Configuring LCD display with pins ${lcdPins}...`,
            );

            // Alarm button, buzzer, and light
            initAlarmHardware({
                buttonAlarmTogglePin,
                isDeviceEnabled,
                ledAlarmStatusPin,
                piezoPin,
                piezoPort,
            });

            // // Traffic light: Set of 3 LEDs
            // initTrafficLight({ ledReadyPin, ledSteadyPin, ledMissPin });

            // // Init LCD last b/c it's slow
            // initLcdScreen(lcdPins);

            // // Play a tune and flash traffic light once the hardware is ready to go
            // playSong({ piezoPin, piezoPort, song: nyanIntro });
            // setTrafficLightState('go');

            // Resolve once hardware initialized
            resolve();
        });
    });
};

module.exports = {
    initHardware,
};
