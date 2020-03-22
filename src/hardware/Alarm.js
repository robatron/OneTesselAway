const constants = require('../Constants');
const { emitEvent, onEvent } = require('../EventUtils');
const { getState, setState } = require('../SharedStore');

let ledAlarmStatus;
let buttonAlarmToggle;

const initAlarmHardware = ({
    buttonAlarmTogglePin,
    isDeviceEnabled,
    ledAlarmStatusPin,
}) => {
    if (isDeviceEnabled) {
        log.info('Initializing alarm hardware...');

        const five = require('johnny-five');

        ledAlarmStatus = new five.Led(ledAlarmStatusPin);
        buttonAlarmToggle = new five.Button(buttonAlarmTogglePin);
    } else {
        log.info('Initializing mock alarm hardware...');
        ledAlarmStatus = {
            off: () => {
                log.info('Mock ledAlarmStates.off');
            },
            on: () => {
                log.info('Mock ledAlarmStates.on');
            },
        };
        buttonAlarmToggle = {
            on: (...rest) => {
                log.info(
                    ['Mock buttonAlarmToggle.on', [...rest].join(' ')].join(
                        ' ',
                    ),
                );
            },
        };
    }

    buttonAlarmToggle.on('release', () => {
        setState({
            key: 'isAlarmEnabled',
            val: currentState => !currentState.isAlarmEnabled,
        });
    });

    onEvent('updated:isAlarmEnabled', isAlarmEnabled => {
        ledAlarmStatus[isAlarmEnabled ? 'on' : 'off']();
    });
};

// Trigger the alarm buzzer if all true:
// - The alarm is enabled
// - The traffic light state is 'go'
const triggerAlarmBuzzer = async trafficLightState => {
    if (
        getState.isAlarmEnabled &&
        trafficLightState === constants.STOPLIGHT_STATES.GO
    ) {
        emitEvent('action:playAlarm', 'nyanIntro');
        setState('isAlarmEnabled', false);
        ledAlarmStatus.off();
    }
};

module.exports = {
    initAlarmHardware,
    triggerAlarmBuzzer,
};
