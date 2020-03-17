const five = require('johnny-five');
const constants = require('../Constants');
const { playSong } = require('../audio/SoundUtils');
const { nyanIntro } = require('../audio/songs');

let isAlarmEnabled = false;
let ledAlarmStatus;
// let isDebugForceGoState = false;

// When the button is released, toggle the alarm status. When the button is held
// toggle a
const initAlarmHardware = ({ buttonAlarmTogglePin, ledAlarmStatusPin }) => {
    ledAlarmStatus = new five.Led(ledAlarmStatusPin);
    const buttonAlarmToggle = new five.Button(buttonAlarmTogglePin);

    buttonAlarmToggle.on('release', () => {
        io.emit('btnAlarmClicked', { isAlarmEnabled });
    });

    io.on('btnAlarmClicked', () => {
        // Toggle alarm status and sync the status LED
        isAlarmEnabled = !isAlarmEnabled;
        ledAlarmStatus[isAlarmEnabled ? 'on' : 'off']();

        log.info(`Toggled alarm enabled: ${isAlarmEnabled}`);
    });
};

// Trigger the alarm buzzer if all true:
// - The alarm is enabled
// - The traffic light state is 'go'
const triggerAlarmBuzzer = async ({
    piezoPin,
    piezoPort,
    trafficLightState,
}) => {
    if (isAlarmEnabled && trafficLightState === constants.STOPLIGHT_STATES.GO) {
        playSong({ piezoPin, piezoPort, song: nyanIntro });

        isAlarmEnabled = false;
        ledAlarmStatus.off();
    }
};

module.exports = {
    getIsAlarmEnabled: () => isAlarmEnabled,
    initAlarmHardware,
    triggerAlarmBuzzer,
    // getIsDebugForceGoState: () => isDebugForceGoState,
};
