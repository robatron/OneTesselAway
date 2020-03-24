const constants = require('./Constants');
const { getLatestLogFromFile } = require('./Logger');
const { getLcdScreenLines } = require('./hardware/LcdScreen');
const { getState } = require('./SharedStore');

// Main arrival info cache
let arrivalInfo = {};

// Get the current device state, referenced by the web UI and other hardware
const getDeviceState = () => ({
    arrivalInfo,
    deviceLogs: getLatestLogFromFile(constants.LOGFILE, {
        reverseLines: true,
    }),
    displayLines: getLcdScreenLines(arrivalInfo),
    isAlarmEnabled: getState().isAlarmEnabled,
});

// Processes device state for use within the Web UI
const processDeviceStateForDisplay = deviceState => ({
    ...deviceState,
    arrivalInfo: JSON.stringify(deviceState.arrivalInfo, null, 2),
    displayLines: deviceState.displayLines.join('\n'),
});

module.exports = {
    getDeviceState,
    processDeviceStateForDisplay,
};
