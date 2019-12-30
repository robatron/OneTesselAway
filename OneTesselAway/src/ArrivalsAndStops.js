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

    const responseJson = await response.text();

    console.log('>>> JSON:', responseJson); // DEBUGGGG

    return JSON.parse(responseJson);
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

const getUpcommingArrivalTimes = async (stopId, routeId, relDateMsEpoch) => {
    const arrivalsForStop = await getArrivalsAndDeparturesForStop(stopId);
    const arrivalsForRoute = extractArrivalsForRoute(arrivalsForStop, routeId);
    const arrivalDates = getUpcommingArrivalDates(arrivalsForRoute);

    return arrivalDates.map(arrivalDate => ({
        arrivalTime: dateTo24HourClockString(arrivalDate),
        minsUntilArrival: getMinutesBetweenMsEpochs(
            arrivalDate.getTime(),
            relDateMsEpoch,
        ),
    }));
};

module.exports = {
    extractArrivalsForRoute,
    getArrivalsAndDeparturesForStop,
    getUpcommingArrivalDates,
    getUpcommingArrivalTimes,
};
