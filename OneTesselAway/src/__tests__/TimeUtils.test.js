const {
    dateTo24HourClockString,
    getMinutesBetweenMsEpochs,
} = require('../TimeUtils');

describe('dateTo24HourClockString', () => {
    it('translates a Date object to a 24-hour clock string', () => {
        const d = new Date(2000, 0, 0, 13, 13);
        const clockString = dateTo24HourClockString(d);
        expect(clockString).toEqual('13:13');
    });

    it('zero-pads hours and minutes < 10', () => {
        const d = new Date(2000, 0, 0, 1, 2);
        const clockString = dateTo24HourClockString(d);
        expect(clockString).toEqual('01:02');
    });
});

describe('getMinutesBetweenMsEpochs', () => {
    it('returns the floored difference between two millisecond-epoch times', () => {
        const time1 = 1577653615000;
        const time2 = 1577651539187;
        const diff = getMinutesBetweenMsEpochs(time1, time2);
        expect(diff).toEqual(34);
    });
});
