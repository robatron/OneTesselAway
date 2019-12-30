// Translate a Date object to two-digit 24-hour clock time string, e.g., 13:15
const dateTo24HourClockString = d => {
    return [d.getHours(), d.getMinutes()]
        .map(t => String(t).padStart(2, 0))
        .join(':');
};

// Calculate the number of minutes between two dates, and return the
// floored value
const getMinutesBetweenDates = (minuend, subtrahend) =>
    Math.floor((minuend.getTime() - subtrahend.getTime()) / 1000 / 60);

module.exports = {
    dateTo24HourClockString,
    getMinutesBetweenDates,
};
