const constants = require('../Constants');
const { emitEvent, onEvent } = require('../EventUtils');
const { getState, setState } = require('../GlobalState');

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

    // Toggle un/set alarm when the button is pressed
    buttonAlarmToggle.on('release', () => {
        setState({
            key: 'isAlarmEnabled',
            val: currentState => !currentState.isAlarmEnabled,
        });
    });

    // The alarm LED should be on when the alarm is set, and off when unset
    onEvent('updated:isAlarmEnabled', isAlarmEnabled => {
        ledAlarmStatus[isAlarmEnabled ? 'on' : 'off']();
    });

    // When the stoplight state changes to 'go', and the alarm is enabled, play
    // the alarm, then disable the alarm
    onEvent('updated:stoplightState', stoplightState => {
        if (
            stoplightState === constants.STOPLIGHT_STATES.GO &&
            getState().isAlarmEnabled
        ) {
            emitEvent('action:playAlarm', 'nyanIntro');
            setState('isAlarmEnabled', false);
            ledAlarmStatus.off();
        }
    });
};

module.exports = {
    initAlarmHardware,
};
