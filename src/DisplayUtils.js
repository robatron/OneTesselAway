// LCD display utils

const DISPLAY_LINE_LENGTH = 16;
const DISPLAY_LINE_COUNT = 2;

// Convert arrival info to display lines for the LCD screen. Ignore
// lines beyond what the display supports, ignore any characters beyond
// what each line supports. `routeDelims` control the the delimeters between the
// route name and the arrival times.
const arrivalInfoToDisplayLines = (
    arrivalInfo,
    routeDelims = Array(DISPLAY_LINE_COUNT).fill(':'),
) => {
    const routeIds = Object.keys(arrivalInfo).slice(0, DISPLAY_LINE_COUNT);

    return routeIds.map((routeId, i) => {
        const displaySections = [];
        const routeInfo = arrivalInfo[routeId];

        // Route name + colon, end-padded to 4 chars with a space, e.g.,
        //  '11:  '
        //  '150: '
        displaySections.push(
            (routeInfo.routeName + routeDelims[i]).padEnd(4, ' '),
        );

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

// Create display lines from arrival info and dynamic delimeters
let getDisplayLinesCount = 0;
const getLcdDisplayLines = arrivalInfo => {
    // Animate route delimeter characters, alternating frames between calls
    const ROUTE_DELIMS = [':', '.'];

    if (getDisplayLinesCount % ROUTE_DELIMS.length) {
        ROUTE_DELIMS.reverse();
    }

    const displayLines = arrivalInfoToDisplayLines(arrivalInfo, ROUTE_DELIMS);

    ++getDisplayLinesCount;

    return displayLines;
};

module.exports = {
    arrivalInfoToDisplayLines,
    getLcdDisplayLines,
};
