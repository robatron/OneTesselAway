const fetch = require('node-fetch');
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

// Return a list of upcoming arrival times for the given stop and route. Arrival
// times will be two-digit 24-hour time in the current timezone
const getUpcommingArrivalsForRouteAtStop = async (stopId, routeId) => {
    const arrivalsForRoute = extractArrivalsForRoute(
        await getArrivalsAndDeparturesForStop(stopId),
        routeId,
    );

    // Create date objects from predicted or scheduled arrival times. If
    // predicted arrival time is 0, use scheduled arrival time
    const arrivalDates = arrivalsForRoute.map(
        arrival =>
            new Date(
                arrival.predictedArrivalTime || arrival.scheduledArrivalTime,
            ),
    );

    const arrivalLocalTimeStrings = arrivalDates.map(d =>
        [d.getHours(), d.getMinutes()]
            .map(t => String(t).padStart(2, 0))
            .join(':'),
    );

    return arrivalLocalTimeStrings;
};

module.exports = {
    extractArrivalsForRoute,
    getArrivalsAndDeparturesForStop,
    getUpcommingArrivalsForRouteAtStop,
};
