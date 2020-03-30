// Alarm module hardware and utilities. Consists of one button and one (blue)
// LED.

const mockRequire = require('./mock-hardware');
const constants = require('../Constants');
const { emitEvent, onGlobalStateUpdate } = require('../EventUtils');
const { getState, setState } = require('../GlobalState');

let ledAlarmStatus;
let buttonAlarmToggle;

const initAlarmHardware = ({
    isDeviceEnabled,
    pinsAndPorts: { btnAlarmTogglePin, ledAlarmStatusPin },
}) => {
    const five = mockRequire('johnny-five', isDeviceEnabled, {
        moduleName: 'Alarm',
    });

    ledAlarmStatus = new five.Led({
        id: 'ledAlarmStatus',
        pin: ledAlarmStatusPin,
    });
    buttonAlarmToggle = new five.Button({
        id: 'buttonAlarmToggle',
        pin: btnAlarmTogglePin,
    });

    // Toggle un/set alarm when the button is pressed
    buttonAlarmToggle.on('release', () => {
        log.info('buttonAlarmToggle released');
        setState(
            'isAlarmEnabled',
            currentState => !currentState.isAlarmEnabled,
        );
    });

    // The alarm LED should be on when the alarm is set, and off when unset
    onGlobalStateUpdate('isAlarmEnabled', isAlarmEnabled => {
        ledAlarmStatus[isAlarmEnabled ? 'on' : 'off']();
    });

    // When the stoplight state changes to 'go', and the alarm is enabled, play
    // the alarm, then disable the alarm
    onGlobalStateUpdate('stoplightState', stoplightState => {
        if (
            stoplightState === constants.STOPLIGHT_STATES.GO &&
            getState('isAlarmEnabled')
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
