const {
    extractArrivalsForRoute,
    getArrivalsAndDeparturesForStop,
    getUpcommingArrivalDates,
    getUpcommingArrivalTimes,
} = require('../ArrivalsAndStops');
const { apiKey } = require('../../oba-api-key.json');
const {
    DEFAULT_ARRIVALS_AND_DEPARTURES_FOR_STOP_RESPONSE,
} = require('./ArrivalsAndStopsTestData');

// Mock fetch so we don't make calls
jest.mock('node-fetch');
const fetch = require('node-fetch');
const { Response } = jest.requireActual('node-fetch');

const DEFAULT_TEST_STOP_ID = '1_12353';
const DEFAULT_TEST_ROUTE_ID = '1_100009';
const API_ARRIVALS_AND_DEPARTURES_FOR_STOP = `http://api.pugetsound.onebusaway.org/api/where/arrivals-and-departures-for-stop`;

beforeEach(() => {
    fetch.mockReturnValue(
        Promise.resolve(
            new Response(
                JSON.stringify(
                    DEFAULT_ARRIVALS_AND_DEPARTURES_FOR_STOP_RESPONSE,
                ),
            ),
        ),
    );
});

describe('getArrivalsAndDeparturesForStop', () => {
    it('gets arrival and departure info for specified stop as JSON', async () => {
        const response = await getArrivalsAndDeparturesForStop(
            DEFAULT_TEST_STOP_ID,
        );

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
            `${API_ARRIVALS_AND_DEPARTURES_FOR_STOP}/${DEFAULT_TEST_STOP_ID}.json?key=${apiKey}`,
        );
        expect(response).toEqual(
            DEFAULT_ARRIVALS_AND_DEPARTURES_FOR_STOP_RESPONSE,
        );
    });

    it('throws an error for non-200 responses', async () => {
        fetch.mockReturnValue(Promise.resolve({ ok: false }));

        await expect(
            getArrivalsAndDeparturesForStop(DEFAULT_TEST_STOP_ID),
        ).rejects.toThrow();
    });
});

describe('extractArrivalsForRoute', () => {
    it('extracts arrivals for a specific route', () => {
        const arrivals = extractArrivalsForRoute(
            DEFAULT_ARRIVALS_AND_DEPARTURES_FOR_STOP_RESPONSE,
            DEFAULT_TEST_ROUTE_ID,
        );
        expect(arrivals.length).toEqual(2);
        arrivals.forEach(arrival =>
            expect(arrival.routeId).toEqual(DEFAULT_TEST_ROUTE_ID),
        );
    });

    it('throws an error if the data object is malformed', () => {
        expect(() => {
            extractArrivalsForRoute({});
        }).toThrow();
    });
});

describe('getUpcommingArrivalDates', () => {
    it('gets upcomming arrival times for a route at a stop', async () => {
        const arrivalsForStop = await getArrivalsAndDeparturesForStop(
            DEFAULT_TEST_STOP_ID,
        );
        const arrivalsForRoute = extractArrivalsForRoute(
            arrivalsForStop,
            DEFAULT_TEST_ROUTE_ID,
        );
        const upcommingArrivalTimes = getUpcommingArrivalDates(
            arrivalsForRoute,
        );

        expect(upcommingArrivalTimes).toEqual([
            new Date(1577651984000),
            new Date(1577653615000),
        ]);
    });
});

describe('getUpcommingArrivalTimes', () => {
    it('returns formatted upcomming arrivial time information', async () => {
        const relDate = 1577671180380;
        const upcommingArrivalTimes = await getUpcommingArrivalTimes(
            DEFAULT_TEST_STOP_ID,
            DEFAULT_TEST_ROUTE_ID,
            relDate,
        );
        expect(upcommingArrivalTimes).toEqual([
            { arrivalTime: '12:39', minsUntilArrival: -320 },
            { arrivalTime: '13:06', minsUntilArrival: -293 },
        ]);
    });
});
