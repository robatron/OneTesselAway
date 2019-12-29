const fetch = require('node-fetch');
const { apiKey } = require('../oba-api-key.json');

const API_BASE = 'http://api.pugetsound.onebusaway.org/api/where';
const API_ARRIVALS_AND_DEPARTURES_FOR_STOP = `${API_BASE}/arrivals-and-departures-for-stop`;

// Raw response from OneBusAway
const _getArrivalsAndDeparturesForStop = async stopId =>
    await fetch(
        `${API_ARRIVALS_AND_DEPARTURES_FOR_STOP}/${stopId}.json?key=${apiKey}`,
    ).then(res => res.json());

module.exports = {
    _getArrivalsAndDeparturesForStop,
};
