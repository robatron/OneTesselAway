const { onEvent } = require('../EventUtils');
const { setState } = require('../GlobalState');

// LCD screen hardware and utilities

// LCD screen hardware info
const SCREEN_LINE_LENGTH = 16;
const SCREEN_LINE_COUNT = 2;

// Track how many times getLcdScreenLines has been called. Supports dynamic
// delimiter animation
let getLcdScreenLinesCount = 0;

// LCD screen hardware
let lcdScreen;

const initLcdScreen = ({ isDeviceEnabled, lcdPins }) => {
    if (isDeviceEnabled) {
        log.info('Initializing LCD screen hardware...');

        const five = require('johnny-five');

        lcdScreen = new five.LCD({ pins: lcdPins });
    } else {
        log.info('Initializing mock LED screen hardware...');

        lcdScreen = {
            cursor: i => ({
                print: line => {
                    log.info(`Mock LCD screen print line "${i}": "${line}"`);
                },
            }),
        };
    }

    onEvent('updated:lcdScreenLines', screenLines => {
        updateLcdScreen(screenLines);
    });

    onEvent('updated:arrivalInfo', arrivalInfo => {
        const screenLines = getLcdScreenLines(arrivalInfo);
        setState('lcdScreenLines', screenLines);
    });
};

// Write lines to the LCD screen
const updateLcdScreen = screenLines => {
    screenLines.forEach((line, i) => {
        lcdScreen.cursor(i, 0).print(line.padEnd(16, ' '));
    });
};

// Create screen lines from arrival info and dynamic delimeters
const getLcdScreenLines = arrivalInfo => {
    // Animate route delimiter characters, alternating frames between calls
    const ROUTE_DELIMS = [':', '.'];

    if (getLcdScreenLinesCount % ROUTE_DELIMS.length) {
        ROUTE_DELIMS.reverse();
    }

    const screenLines = arrivalInfoToScreenLines(arrivalInfo, ROUTE_DELIMS);

    ++getLcdScreenLinesCount;

    return screenLines;
};

// Convert arrival info to display lines for the LCD screen. Ignore
// lines beyond what the screen supports, ignore any characters beyond
// what each line supports. `routeDelims` control the the delimiters between the
// route name and the arrival times.
const arrivalInfoToScreenLines = (
    arrivalInfo,
    routeDelims = Array(SCREEN_LINE_COUNT).fill(':'),
) => {
    const routeIds = Object.keys(arrivalInfo).slice(0, SCREEN_LINE_COUNT);

    return routeIds.map((routeId, i) => {
        const screenSections = [];
        const routeInfo = arrivalInfo[routeId];

        // Route name + colon, end-padded to 4 chars with a space, e.g.,
        //  '11:  '
        //  '150: '
        screenSections.push(
            (routeInfo.routeName + routeDelims[i]).padEnd(4, ' '),
        );

        // For each arrival time, usually 2 or 3, push a start-padded "minutes-
        // 'till" section to 3 chars, e.g.,
        //  '120'
        //  ' 35'
        //  '  1'
        //  ' -3'
        routeInfo.upcomingArrivalTimes.forEach(upcomingArrival => {
            screenSections.push(
                upcomingArrival.minsUntilArrival.toString().padStart(3, ' '),
            );
        });

        // Join all sections together w/ a space, end-padded to 16 chars
        //  '11:   -3  15    '
        //  '12:    1  25  35'
        return screenSections
            .join(' ')
            .padEnd(SCREEN_LINE_LENGTH, ' ')
            .slice(0, SCREEN_LINE_LENGTH);
    });
};

module.exports = {
    initLcdScreen,
    getLcdScreenLines, // Deprecated
};
