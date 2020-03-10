const five = require('johnny-five');

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

module.exports = {
    getAlarmIsEnabled: () => isAlarmEnabled,
    initAlarmHardware,
};
