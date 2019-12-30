const fetch = require('node-fetch');
const {
    dateTo24HourClockString,
    getMinutesBetweenDates,
} = require('./TimeUtils');
const { apiKey } = require('../oba-api-key.json');

const API_ARRIVALS_AND_DEPARTURES_FOR_STOP = `http://api.pugetsound.onebusaway.org/api/where/arrivals-and-departures-for-stop`;

// JSON response from OneBusAway
const getArrivalsAndDeparturesForStop = async stopId => {
    const response = await fetch(
        `${API_ARRIVALS_AND_DEPARTURES_FOR_STOP}/${stopId}.json?key=${apiKey}`,
    );

    // If response is not a 200, throw an error
    if (!response.ok) {
        throw new Error(
            'Fetch error. Raw response:' + JSON.stringify(response, null, 2),
        );
    }

    // Returning text is safer and more versitale than returning JSON in case
    // invalid JSON is returned from service. We'll manually parse JSON below.
    const responseText = await response.text();

    try {
        return JSON.parse(responseText);
    } catch (e) {
        throw new Error(
            `Unable to parse JSON response. Response text (might be blank): ${responseText}`,
        );
    }
};

const extractArrivalsForRoute = (arrivalsAndDeparturesForStop, routeId) => {
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

// Return a sorted list (ascending) of upcoming arrival times for a route as
// Date objects for the given stop and route. Predicted time will be used when
// possible, otherwise the scheduled time will be used.
const getUpcommingArrivalDates = arrivalsForRoute =>
    arrivalsForRoute
        .map(
            arrival =>
                new Date(
                    arrival.predictedArrivalTime ||
                        arrival.scheduledArrivalTime,
                ),
        )
        .sort();

// Return a dictionary of trip IDs to arrival dates given an array of arrivals
const getArrivalDatesByTripId = arrivals =>
    arrivals.reduce((arrivalDates, arrival) => {
        arrivalDates[arrival.tripId] = new Date(
            arrival.predictedArrivalTime || arrival.scheduledArrivalTime,
        );
        return arrivalDates;
    }, {});

// Returns a list of upcomming arrival times for the specified stop and route
const getUpcommingArrivalTimes = async (stopId, routeId, currentDate) => {
    const arrivalsForStop = await getArrivalsAndDeparturesForStop(stopId);
    const arrivalsForRoute = extractArrivalsForRoute(arrivalsForStop, routeId);
    const arrivalDates = getArrivalDatesByTripId(arrivalsForRoute);

    return Object.keys(arrivalDates).map(tripId => {
        const arrivalDate = arrivalDates[tripId];
        return {
            arrivalTime: dateTo24HourClockString(arrivalDate),
            minsUntilArrival: getMinutesBetweenDates(arrivalDate, currentDate),
            tripId,
        };
    });
};

module.exports = {
    extractArrivalsForRoute,
    getArrivalsAndDeparturesForStop,
    getUpcommingArrivalDates,
    getUpcommingArrivalTimes,
};
