const { DEFAULT_ARRIVAL_INFO } = require('./__data__/ArrivalInfoTestData');
const { arrivalInfoToDisplayLines } = require('../DisplayUtils');

describe('arrivalInfoToDisplayLines', () => {
    it('generates formatted display lines', () => {
        const displayLines = arrivalInfoToDisplayLines(DEFAULT_ARRIVAL_INFO);
        expect(displayLines.length).toEqual(2);
        expect(displayLines).toEqual([
            // "Route 11 in 4, and 19 minutes"
            '11:    4  19    ',
            // "Route 12 in -1, 16, and 120 minutes"
            '12:   -1  16 120',
        ]);
    });

    it('supports custom delimeters', () => {
        const displayLines = arrivalInfoToDisplayLines(DEFAULT_ARRIVAL_INFO, [
            '>',
            '.',
        ]);
        expect(displayLines).toEqual(['11>    4  19    ', '12.   -1  16 120']);
    });
});
