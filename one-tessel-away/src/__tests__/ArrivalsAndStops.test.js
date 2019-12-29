const { _getArrivalsAndDeparturesForStop } = require('../ArrivalsAndStops');

describe('ArrivalsAndStops', () => {
    describe('_getArrivalsAndDeparturesForStop (REAL HTTP CALL, NO MOCKING!)', () => {
        it('gets arrival and departure info for specified stop', async () => {
            const response = await _getArrivalsAndDeparturesForStop('1_12351');
            expect(response.code).toEqual(200);
            expect(response).toHaveProperty('data.entry.arrivalsAndDepartures');
        });
    });
});
