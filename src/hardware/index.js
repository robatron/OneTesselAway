// Entrypoint for all hardware modules.

const { initAlarmHardware } = require('./Alarm');
const { initBuzzerHardware } = require('./Buzzer');
const { initLcdScreen } = require('./LcdScreen');
const mockRequire = require('./mock-hardware');
const { initStoplight } = require('./Stoplight');
const constants = require('../Constants');
const { emitEvent } = require('../EventUtils');
const { setState } = require('../GlobalState');

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
    const five = mockRequire('johnny-five', isDeviceEnabled, {
        moduleName: 'Index',
    });
    const Tessel = mockRequire('tessel-io', isDeviceEnabled);
    const board = new five.Board({ id: 'Index', io: new Tessel() });

    return new Promise(resolve => {
        board.on('ready', () => {
            log.info(
                `Device board ready. Configuring LCD display with pins ${lcdPins}...`,
            );

            // Init buzzer hardware
            initBuzzerHardware({
                isDeviceEnabled,
                piezoPin,
                piezoPort,
            });

            // Init alarm hardware
            initAlarmHardware({
                buttonAlarmTogglePin,
                isDeviceEnabled,
                ledAlarmStatusPin,
            });

            // Init stoplight hardware
            initStoplight({
                isDeviceEnabled,
                ledReadyPin,
                ledSteadyPin,
                ledMissPin,
            });

            // Init LCD last b/c it's slow
            initLcdScreen({ isDeviceEnabled, lcdPins });

            // Play a tune and flash stoplight once the hardware is ready to go
            emitEvent('action:playAlarm', 'nyanIntro');
            setState('stoplightState', constants.STOPLIGHT_STATES.GO);

            // Resolve once hardware initialized
            resolve();
        });
    });
};

module.exports = {
    initHardware,
};
