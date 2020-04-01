// Entrypoint for all hardware modules.

const { initAlarmHardware } = require('./Alarm');
const { initBuzzerHardware } = require('./Buzzer');
const { initLcdScreen } = require('./LcdScreen');
const mockRequire = require('./mock-hardware');
const { initStoplight } = require('./Stoplight');
const { emitEvent } = require('../EventUtils');

const initHardware = hardwareParams => {
    const { isDeviceEnabled } = hardwareParams;
    const five = mockRequire('johnny-five', isDeviceEnabled, {
        moduleName: 'Index',
    });
    const Tessel = mockRequire('tessel-io', isDeviceEnabled);
    const board = new five.Board({ id: 'Index', io: new Tessel() });

    return new Promise(resolve => {
        board.on('ready', () => {
            // Init buzzer hardware
            initBuzzerHardware(hardwareParams);

            // Init alarm hardware
            initAlarmHardware(hardwareParams);

            // Init stoplight hardware
            initStoplight(hardwareParams);

            // Init LCD screen (do last b/c it's slow)
            initLcdScreen(hardwareParams);

            // Play a tune and resolve once the hardware is ready to go
            emitEvent('action:playAlarm', 'nyanIntro');
            resolve();
        });
    });
};

module.exports = {
    initHardware,
};
