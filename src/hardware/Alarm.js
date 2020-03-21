const five = require('johnny-five');
const constants = require('../Constants');
const { emitEvent, onEvent } = require('../EventUtils');
const { setState } = require('../SharedStore');
const { playSong } = require('../audio/SoundUtils');
const songs = require('../audio/songs');

let isAlarmEnabled = false;
let ledAlarmStatus;

// When the button is released, toggle the alarm status. When the button is held
// toggle a
const initAlarmHardware = ({
    buttonAlarmTogglePin,
    ledAlarmStatusPin,
    piezoPin,
    piezoPort,
}) => {
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

    onEvent('action:playAlarm', songName => {
        playSong({ piezoPin, piezoPort, song: songs[songName] });
    });
};

// Trigger the alarm buzzer if all true:
// - The alarm is enabled
// - The traffic light state is 'go'
const triggerAlarmBuzzer = async trafficLightState => {
    if (isAlarmEnabled && trafficLightState === constants.STOPLIGHT_STATES.GO) {
        emitEvent('action:playAlarm', 'nyanIntro');

        isAlarmEnabled = false;
        ledAlarmStatus.off();
    }
};

module.exports = {
    getIsAlarmEnabled: () => isAlarmEnabled,
    initAlarmHardware,
    triggerAlarmBuzzer,
};
