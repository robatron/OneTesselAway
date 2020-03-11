const {
    _getArrivalDatesByTripId,
    _getArrivalsAndDeparturesForStop,
    _getArrivalsForRoute,
    getUpcomingArrivalTimes,
} = require('../ArrivalsAndStops');
const { apiKey } = require('../../oba-api-key.json');
const {
    DEFAULT_ARRIVALS_AND_DEPARTURES_FOR_STOP_RESPONSE,
} = require('./__data__/ArrivalInfoTestData');

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

describe('_getArrivalsAndDeparturesForStop', () => {
    it('gets arrival and departure info for specified stop as JSON', async () => {
        const response = await _getArrivalsAndDeparturesForStop(
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
            _getArrivalsAndDeparturesForStop(DEFAULT_TEST_STOP_ID),
        ).rejects.toThrow();
    });
});

describe('_getArrivalsForRoute', () => {
    it('extracts arrivals for a specific route', () => {
        const arrivals = _getArrivalsForRoute(
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
            _getArrivalsForRoute({});
        }).toThrow();
    });
});

describe('_getArrivalDatesByTripId', () => {
    it('gets upcoming arrival times for a route at a stop', async () => {
        const arrivalsForStop = await _getArrivalsAndDeparturesForStop(
            DEFAULT_TEST_STOP_ID,
        );
        const arrivalsForRoute = _getArrivalsForRoute(
            arrivalsForStop,
            DEFAULT_TEST_ROUTE_ID,
        );
        const upcomingArrivalTimes = _getArrivalDatesByTripId(arrivalsForRoute);

        expect(upcomingArrivalTimes).toEqual({
            // Predicted arrival time is not available, so assert using
            // scheduled time instead
            '1_40560755': new Date(1577722031000),
            '1_40560756': new Date(1577722991000),
        });
    });
});

describe('getUpcomingArrivalTimes', () => {
    it('returns formatted upcoming arrival time information', async () => {
        const callDate = new Date(1577721840746);
        const upcomingArrivalTimes = await getUpcomingArrivalTimes(
            DEFAULT_TEST_STOP_ID,
            DEFAULT_TEST_ROUTE_ID,
            callDate,
        );
        expect(upcomingArrivalTimes).toEqual([
            {
                basisDate: new Date(1577721840746),
                clock: '08:07',
                minsUntilArrival: 3,
                tripId: '1_40560755',
            },
            {
                basisDate: new Date(1577721840746),
                clock: '08:23',
                minsUntilArrival: 19,
                tripId: '1_40560756',
            },
        ]);
    });
});
