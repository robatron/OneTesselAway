let isAlarmEnabled = false;
let buttonAlarmToggle;
let ledAlarmStatus;

// When the button is released, toggle the alarm status
const initAlarmHardware = ({ buttonAlarmToggle, ledAlarmStatus }) => {
    buttonAlarmToggle.on('release', () => {
        console.log(`Button "buttonAlarmToggle" released!`);

        // Toggle alarm status and sync the status LED
        isAlarmEnabled = !isAlarmEnabled;
        ledAlarmStatus[isAlarmEnabled ? 'on' : 'off']();
    });
};

module.exports = {
    getAlarmIsEnabled: () => isAlarmEnabled,
    initAlarmHardware,
};
