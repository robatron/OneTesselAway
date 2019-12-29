const {
    _getArrivalsAndDeparturesForStop,
    getArrivalsForRoute,
} = require('../ArrivalsAndStops');

const DEFAULT_TEST_STOP_ID = '1_12351';
const DEFAULT_TEST_ROUTE_ID = '1_100009';

describe('ArrivalsAndStops', () => {
    describe('_getArrivalsAndDeparturesForStop (REAL HTTP CALL, NO MOCKING!)', () => {
        it('gets arrival and departure info for specified stop', async () => {
            const response = await _getArrivalsAndDeparturesForStop(
                DEFAULT_TEST_STOP_ID,
            );
            expect(response.code).toEqual(200);
            expect(response).toHaveProperty('data.entry.arrivalsAndDepartures');
        });
    });

    describe('getArrivalsForRoute', () => {
        it('gets arrivals for a specific route at a specific stop', async () => {
            const arrivals = await getArrivalsForRoute(
                DEFAULT_TEST_STOP_ID,
                DEFAULT_TEST_ROUTE_ID,
            );
            arrivals.forEach(arrival => {
                expect(arrival.routeId).toEqual(DEFAULT_TEST_ROUTE_ID);
            });
        });
    });
});
