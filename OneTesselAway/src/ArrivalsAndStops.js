const fetch = require('node-fetch');
const {
    dateTo24HourClockString,
    getMinutesBetweenMsEpochs,
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

    return await response.json();
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

// Return a sorted list (ascending) of upcoming arrival times as Date objects
// for the given stop and route. Predicted time will be used when possible,
// otherwise the scheduled time will be used.
const getUpcommingArrivalDates = async (stopId, routeId) => {
    const arrivalsForRoute = extractArrivalsForRoute(
        await getArrivalsAndDeparturesForStop(stopId),
        routeId,
    );

    return arrivalsForRoute
        .map(
            arrival =>
                new Date(
                    arrival.predictedArrivalTime ||
                        arrival.scheduledArrivalTime,
                ),
        )
        .sort();
};

const getUpcommingArrivalTimes = async (stopId, routeId) =>
    (await getUpcommingArrivalDates(stopId, routeId)).map(arrivalDate =>
        dateTo24HourClockString(arrivalDate),
    );

// const getUpcommingArrivalMinsUntil = async (stopId, routeId) =>
//     (await getUpcommingArrivalDates(stopId, routeId)).map(arrivalDate =>
//         getMinutesBetweenMsEpochs(arrivalDate),
//     );

module.exports = {
    extractArrivalsForRoute,
    getArrivalsAndDeparturesForStop,
    getUpcommingArrivalDates,
    getUpcommingArrivalTimes,
};
