const five = require('johnny-five');
const { playSong } = require('../SoundUtils');
const { nyanIntro } = require('../songs');

let isAlarmEnabled = false;
let buttonAlarmToggle;
let ledAlarmStatus;

// When the button is released, toggle the alarm status
const initAlarmHardware = ({ buttonAlarmTogglePin, ledAlarmStatusPin }) => {
    ledAlarmStatus = new five.Led(ledAlarmStatusPin);
    buttonAlarmToggle = new five.Button(buttonAlarmTogglePin);

    buttonAlarmToggle.on('release', () => {
        console.log(`Button "buttonAlarmToggle" released!`);

        // Toggle alarm status and sync the status LED
        isAlarmEnabled = !isAlarmEnabled;
        ledAlarmStatus[isAlarmEnabled ? 'on' : 'off']();
    });
};

// Trigger the alarm buzzer if all true:
// - The alarm is enabled
// - The traffic light state is 'go'
// - The previous state != current state
let previousTrafficLightState = null;
const triggerAlarmBuzzer = async ({
    piezoPin,
    piezoPort,
    trafficLightState,
}) => {
    if (
        isAlarmEnabled &&
        trafficLightState === 'go' &&
        trafficLightState !== previousTrafficLightState
    ) {
        await playSong({ piezoPin, piezoPort, song: nyanIntro });

        isAlarmEnabled = false;
        ledAlarmStatus.off();

        previousTrafficLightState = trafficLightState;
    }
};

module.exports = {
    getIsAlarmEnabled: () => isAlarmEnabled,
    initAlarmHardware,
    triggerAlarmBuzzer,
};
