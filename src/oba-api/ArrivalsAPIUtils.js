const fetch = require('node-fetch');
const { wait } = require('../AsyncUtils');
const constants = require('../Constants');
const { onEvent } = require('../EventUtils');
const { getState, setState } = require('../GlobalState');
const {
    dateTo24HourClockString,
    getMinutesBetweenDates,
} = require('../TimeUtils');
const { apiKey } = require('../../oba-api-key.json');

// Fetch upcoming arrivals data for the given stop from the OneBusAway API
const _getArrivalsAndDeparturesForStop = async stopId => {
    // Allow using example states
    const obaApiState = getState('obaApiEgState');
    const egObaApiRespUrl = `${constants.WEB_UI_ADDRESS}:${constants.WEB_UI_PORT}/eg-oba-api-response/${stopId}/${obaApiState}`;
    const obaApiUrl = `${constants.API_URL}/${stopId}.json?key=${apiKey}`;
    const apiUrl = obaApiState ? egObaApiRespUrl : obaApiUrl;

    log.info(`Fetching ${apiUrl}...`);

    const response = await fetch(apiUrl);

    // If response is not a 200, log a warning
    if (!response.ok) {
        log.warn(
            'Error fetching from API. Raw response:' +
                JSON.stringify(response, null, 2),
        );
    }

    // Returning text instead of JSON allows us to catch JSON parse errors
    // separately, and to inspect body contents when that happens
    const responseText = await response.text();

    try {
        return JSON.parse(responseText);
    } catch (e) {
        log.warn(
            'Unable to parse JSON response. Response text (might be blank):' +
                responseText,
        );
    }
};

// Get an arrivals list for a specific route from a OneBusAway response
const _getArrivalsForRoute = (arrivalsAndDeparturesForStop, routeId) => {
    let arrivalsAndDepartures;

    try {
        arrivalsAndDepartures =
            arrivalsAndDeparturesForStop.data.entry.arrivalsAndDepartures;
    } catch (e) {
        log.warn(
            'Malformed arrivalsAndDeparturesForStop object:' +
                JSON.stringify(arrivalsAndDeparturesForStop, null, 2),
        );
    }

    const arrivalsForRoute = arrivalsAndDepartures.filter(
        arrival => arrival.routeId === routeId,
    );

    return arrivalsForRoute;
};

// Return a dictionary of trip IDs to arrival dates given an array of arrivals.
// Use scheduled arrival times when predicted times aren't available.
const _getArrivalDatesByTripId = arrivals =>
    arrivals.reduce((arrivalDates, arrival) => {
        arrivalDates[arrival.tripId] = new Date(
            arrival.predictedArrivalTime || arrival.scheduledArrivalTime,
        );
        return arrivalDates;
    }, {});

// Returns a list of upcoming arrival times for the specified stop and route
const _getUpcomingArrivalTimes = async (stopId, routeId) => {
    const arrivalsForStop = await _getArrivalsAndDeparturesForStop(stopId);
    const basisDate = new Date(arrivalsForStop.currentTime);
    const arrivalsForRoute = _getArrivalsForRoute(arrivalsForStop, routeId);
    const arrivalDatesByTripId = _getArrivalDatesByTripId(arrivalsForRoute);

    return Object.keys(arrivalDatesByTripId).map(tripId => {
        const arrivalDate = arrivalDatesByTripId[tripId];
        return {
            clock: dateTo24HourClockString(arrivalDate),
            minsUntilArrival: getMinutesBetweenDates(arrivalDate, basisDate),
            basisDate,
            tripId,
        };
    });
};

const _updateArrivalInfoOnce = async isManualTrigger => {
    const targetRoutes = constants.TARGET_ROUTES;
    const targetRouteIds = Object.keys(targetRoutes);
    const arrivalInfo = getState('arrivalInfo') || {};

    for (let i = 0; i < targetRouteIds.length; ++i) {
        const currentDate = new Date();
        const routeId = targetRouteIds[i];
        const routeName = targetRoutes[routeId].routeName;
        const stopId = targetRoutes[routeId].stopId;
        const stopName = targetRoutes[routeId].stopName;
        let upcomingArrivalTimes;

        try {
            upcomingArrivalTimes = await _getUpcomingArrivalTimes(
                stopId,
                routeId,
            );
        } catch (e) {
            log.warn(
                `Failed to get upcoming arrival times for route ${routeId} and stop ${stopId}: ${e.toString()}`,
            );
        }

        if (upcomingArrivalTimes && upcomingArrivalTimes.length) {
            arrivalInfo[routeId] = {
                deviceRequestDate: currentDate,
                routeName,
                stopName,
                upcomingArrivalTimes,
            };
        } else {
            log.warn(
                `No upcoming arrivals for route ${routeId} and stop ${stopId}. Using previous value.`,
            );
            arrivalInfo[routeId] = {
                ...arrivalInfo[routeId],
                isUsingOldArrivalTimes: true,
            };
        }

        // If there's another fetch to be made, wait a moment to avoid hitting
        // the OneBusAway API rate limit. Skip waiting if this update was
        // triggered manually.
        if (i !== targetRouteIds.length - 1 && !isManualTrigger) {
            const waitMs = constants.API_CONSECUTIVE_FETCH_PADDING;
            log.info(`Waiting ${waitMs} ms before making the next fetch...`);
            await wait(waitMs);
        }
    }

    setState('arrivalInfo', arrivalInfo);
};

// Update arrival info forever at the specified interval. Blocks until first
// arrival info is returned. Also registers an immediate update arrival info
// action.
const updateArrivalInfoUntilStopped = async updateInterval => {
    let isStopped = false;

    // Allow arrival time update on-command
    onEvent('action:updateArrivalInfo', () => {
        log.info('IMMEDIATELY updating arrival info');
        _updateArrivalInfoOnce(true);
    });

    // Await the first arrival info fetch before continuing
    await _updateArrivalInfoOnce();

    // Throw repeat calls into the background so we don't block forever
    (async () => {
        while (!isStopped) {
            await _updateArrivalInfoOnce();
            await wait(updateInterval);
        }
    })();

    // Return a function to allow the updating to be stopped
    return () => (isStopped = true);
};

module.exports = {
    _getArrivalDatesByTripId,
    _getArrivalsAndDeparturesForStop,
    _getArrivalsForRoute,
    _getUpcomingArrivalTimes,
    _updateArrivalInfoOnce,
    updateArrivalInfoUntilStopped,
};
