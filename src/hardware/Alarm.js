const five = require('johnny-five');
const constants = require('../Constants');
const { emitEvent, onEvent } = require('../EventUtils');
const { setState } = require('../SharedStore');
const { playSong } = require('../audio/SoundUtils');
const { nyanIntro } = require('../audio/songs');

let isAlarmEnabled = false;
let ledAlarmStatus;

// When the button is released, toggle the alarm status. When the button is held
// toggle a
const initAlarmHardware = ({ buttonAlarmTogglePin, ledAlarmStatusPin }) => {
    ledAlarmStatus = new five.Led(ledAlarmStatusPin);
    const buttonAlarmToggle = new five.Button(buttonAlarmTogglePin);

    buttonAlarmToggle.on('release', () => {
        setState({
            key: 'isAlarmEnabled',
            val: currentState => !currentState['isAlarmEnabled'],
        });
    });

    onEvent('updated:isAlarmEnabled', isAlarmEnabled => {
        ledAlarmStatus[isAlarmEnabled ? 'on' : 'off']();
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
};
