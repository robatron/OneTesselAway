const {
    dateTo24HourClockString,
    getMinutesBetweenDates,
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

describe('getMinutesBetweenDates', () => {
    it('returns the difference between two dates, in minutes, floored', () => {
        const date1 = new Date(1577653615000);
        const date2 = new Date(1577651539187);
        const minutes = getMinutesBetweenDates(date1, date2);
        expect(minutes).toEqual(34);
    });
});
