const constants = require('./Constants');
const { getUpcomingArrivalTimes } = require('./ArrivalsAndStops');
const { getLatestLogFromFile } = require('./Logger');
const { getLcdDisplayLines } = require('./DisplayUtils');
const { getState } = require('./SharedStore');

// Main arrival info cache
let arrivalInfo = {};

// Get the current device state, referenced by the web UI and other hardware
const getDeviceState = () => ({
    arrivalInfo,
    deviceLogs: getLatestLogFromFile(constants.LOGFILE, {
        reverseLines: true,
    }),
    displayLines: getLcdDisplayLines(arrivalInfo),
    isAlarmEnabled: getState().isAlarmEnabled,
    stoplightState: getStoplightState(arrivalInfo),
});

// Return one of the 'ready', 'steady', 'go', 'miss' stoplight states based on
// the closest arrival time of the primary route
// TODO: Move logic to Stoplight hardware?
const getStoplightState = arrivalInfo => {
    const closestMinsUntilArrival =
        arrivalInfo[constants.PRIMARY_ROUTE].upcomingArrivalTimes[0]
            .minsUntilArrival;
    const stoplightStates = Object.keys(constants.STOPLIGHT_TIME_RANGES);

    let stoplightState;
    for (let i = 0; stoplightStates.length; ++i) {
        const curStoplightState = stoplightStates[i];
        const curStoplightStateRange =
            constants.STOPLIGHT_TIME_RANGES[curStoplightState];
        if (
            closestMinsUntilArrival >= curStoplightStateRange[0] &&
            closestMinsUntilArrival < curStoplightStateRange[1]
        ) {
            stoplightState = curStoplightState;
            break;
        }
    }

    return stoplightState;
};

// Processes device state for use within the Web UI
const processDeviceStateForDisplay = deviceState => ({
    ...deviceState,
    arrivalInfo: JSON.stringify(deviceState.arrivalInfo, null, 2),
    displayLines: deviceState.displayLines.join('\n'),
});

// Updates the arrival info in memory. If an update fails, log an error
// and move on.
const updateArrivalInfo = async targetRoutes => {
    const targetRouteIds = Object.keys(targetRoutes);

    for (let i = 0; i < targetRouteIds.length; ++i) {
        const currentDate = new Date();
        const routeId = targetRouteIds[i];
        const routeName = targetRoutes[routeId].routeName;
        const stopId = targetRoutes[routeId].stopId;
        const stopName = targetRoutes[routeId].stopName;
        let upcomingArrivalTimes;

        try {
            upcomingArrivalTimes = await getUpcomingArrivalTimes(
                stopId,
                routeId,
            );
        } catch (e) {
            log.warn(
                `Failed to get upcoming arrival times for route ${routeId} and stop ${stopId}: ${e.toString()}`,
            );
        }

        if (upcomingArrivalTimes) {
            arrivalInfo[routeId] = {
                deviceRequestDate: currentDate,
                routeName,
                stopName,
                upcomingArrivalTimes,
            };
        }
    }
};

module.exports = {
    getDeviceState,
    processDeviceStateForDisplay,
    updateArrivalInfo,
};
