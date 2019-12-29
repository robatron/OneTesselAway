const fetch = require('node-fetch');
const { apiKey } = require('../oba-api-key.json');

const API_BASE = 'http://api.pugetsound.onebusaway.org/api/where';
const API_ARRIVALS_AND_DEPARTURES_FOR_STOP = `${API_BASE}/arrivals-and-departures-for-stop`;

// Raw response from OneBusAway
const _getArrivalsAndDeparturesForStop = async stopId =>
    await fetch(
        `${API_ARRIVALS_AND_DEPARTURES_FOR_STOP}/${stopId}.json?key=${apiKey}`,
    )
        .then(res => {
            if (res.ok) {
                // res.status >= 200 && res.status < 300
                return res;
            } else {
                throw new Error('Fetch error:' + res.statusText);
            }
        })
        .then(res => res.json());

const getArrivalsForRoute = async (stopId, routeId) => {
    const arrivalsAndDeparturesForStop = await _getArrivalsAndDeparturesForStop(
        stopId,
    );

    const arrivalsAndDepartures =
        ((arrivalsAndDeparturesForStop.data || {}).entry || {})
            .arrivalsAndDepartures || [];
    const arrivalsForRoute = arrivalsAndDepartures.filter(
        arrival => arrival.routeId === routeId,
    );

    return arrivalsForRoute;
};

module.exports = {
    _getArrivalsAndDeparturesForStop,
    getArrivalsForRoute,
};
