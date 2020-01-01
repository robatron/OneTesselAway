// LCD display utils

const DISPLAY_LINE_LENGTH = 16;
const DISPLAY_LINE_COUNT = 2;

// Convert arrival info to display lines for the LCD screen. Ignore
// lines beyond what the display supports, ignore any characters beyond
// what each line supports.
const arrivalInfoToDisplayLines = (arrivalInfo, options) => {
    const routeIds = Object.keys(arrivalInfo).slice(0, DISPLAY_LINE_COUNT);
    let { routeDelim, routeDelimAlt } = options || {};

    routeDelim = routeDelim || ':';
    routeDelimAlt = routeDelimAlt || routeDelim;

    return routeIds.map((routeId, i) => {
        const displaySections = [];
        const routeInfo = arrivalInfo[routeId];

        // Route name + colon, end-padded to 4 chars with a space, e.g.,
        //  '11:  '
        //  '150: '
        const delim = i % 2 === 0 ? routeDelim : routeDelimAlt;
        displaySections.push((routeInfo.routeName + delim).padEnd(4, ' '));

        // For each arrival time, usually 2 or 3, push a start-padded "minutes-
        // 'till" section to 3 chars, e.g.,
        //  '120'
        //  ' 35'
        //  '  1'
        //  ' -3'
        routeInfo.upcomingArrivalTimes.forEach(upcomingArrival => {
            displaySections.push(
                upcomingArrival.minsUntilArrival.toString().padStart(3, ' '),
            );
        });

        // Join all sections together w/ a space, end-padded to 16 chars
        //  '11:   -3  15    '
        //  '12:    1  25  35'
        return displaySections
            .join(' ')
            .padEnd(DISPLAY_LINE_LENGTH, ' ')
            .slice(0, DISPLAY_LINE_LENGTH);
    });
};

module.exports = {
    arrivalInfoToDisplayLines,
};
