const fetch = require('node-fetch');
const {
    dateTo24HourClockString,
    getMinutesBetweenDates,
} = require('./TimeUtils');
const { apiKey } = require('../oba-api-key.json');

// OneBusAway API endpoint for "arrivals" data at a stop
const API_ARRIVALS_AND_DEPARTURES_FOR_STOP = `http://api.pugetsound.onebusaway.org/api/where/arrivals-and-departures-for-stop`;

// Fetch upcoming arrivals data for the given stop from the OneBusAway API
const _getArrivalsAndDeparturesForStop = async stopId => {
    const response = await fetch(
        `${API_ARRIVALS_AND_DEPARTURES_FOR_STOP}/${stopId}.json?key=${apiKey}`,
    );

    // If response is not a 200, throw an error
    if (!response.ok) {
        throw new Error(
            'Fetch error. Raw response:' + JSON.stringify(response, null, 2),
        );
    }

    // Returning text instead of JSON allows us to catch JSON parse errors
    // separately, and to inspect body contents when that happens
    const responseText = await response.text();

    try {
        return JSON.parse(responseText);
    } catch (e) {
        throw new Error(
            `Unable to parse JSON response. Response text (might be blank): ${responseText}`,
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
        throw new Error(
            'Malformed arrivalsAndDeparturesForStop object:',
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

// Returns a list of upcomming arrival times for the specified stop and route
const getUpcomingArrivalTimes = async (stopId, routeId, currentDate) => {
    const arrivalsForStop = await _getArrivalsAndDeparturesForStop(stopId);
    const arrivalsForRoute = _getArrivalsForRoute(arrivalsForStop, routeId);
    const arrivalDatesByTripId = _getArrivalDatesByTripId(arrivalsForRoute);

    return Object.keys(arrivalDatesByTripId).map(tripId => {
        const arrivalDate = arrivalDatesByTripId[tripId];
        return {
            clock: dateTo24HourClockString(arrivalDate),
            minsUntilArrival: getMinutesBetweenDates(arrivalDate, currentDate),
            tripId,
        };
    });
};

module.exports = {
    _getArrivalDatesByTripId,
    _getArrivalsAndDeparturesForStop,
    _getArrivalsForRoute,
    getUpcomingArrivalTimes,
};
