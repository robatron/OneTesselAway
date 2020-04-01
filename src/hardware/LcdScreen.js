// LCD screen hardware and utilities. Consists of one 2x16 LCD screen.

const mockRequire = require('./mock-hardware');
const { onGlobalStateUpdate } = require('../EventUtils');
const { getState, setState } = require('../GlobalState');

// LCD screen hardware info
const SCREEN_LINE_LENGTH = 16;
const SCREEN_LINE_COUNT = 2;

// Track how many times getLcdScreenLines has been called. Supports dynamic
// delimiter animation
let getLcdScreenLinesCount = 0;

// LCD screen hardware
let lcdScreen;

const initLcdScreen = ({ isDeviceEnabled, pinsAndPorts: { lcdPins } }) => {
    const five = mockRequire('johnny-five', isDeviceEnabled, {
        moduleName: 'LcdScreen',
    });

    lcdScreen = new five.LCD({ id: 'lcdScreen', pins: lcdPins });

    onGlobalStateUpdate('lcdScreenLines', screenLines => {
        updateLcdScreen(screenLines);
    });

    onGlobalStateUpdate('arrivalInfo', arrivalInfo => {
        const screenLines = getLcdScreenLines(arrivalInfo);
        setState('lcdScreenLines', screenLines);
    });
};

// Print lines to the LCD screen, unless the buzzer is currently playing b/c
// it slows the buzzer tune which makes it sound weird.
const updateLcdScreen = screenLines => {
    if (!getState('isBuzzerPlaying')) {
        screenLines.forEach((line, i) => {
            lcdScreen.cursor(i, 0).print(line.padEnd(16, ' '));
        });
    }
};

// Create screen lines from arrival info and dynamic delimeters. Alternate
// between the delimeters each call.
const getLcdScreenLines = arrivalInfo => {
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
// route name and the arrival times. If a route is using old arrival times,
// force the delimeter to be `oldTimeDelim`.
const arrivalInfoToScreenLines = (
    arrivalInfo,
    oldTimeDelim = '*',
    routeDelims = Array(SCREEN_LINE_COUNT).fill(':'),
) => {
    const routeIds = Object.keys(arrivalInfo).slice(0, SCREEN_LINE_COUNT);

    return routeIds.map((routeId, i) => {
        const screenSections = [];
        const {
            isUsingOldArrivalTimes,
            routeName,
            upcomingArrivalTimes,
        } = arrivalInfo[routeId];

        // Route name + delimeter, end-padded to 4 chars with a space, e.g.,
        //  '11:  '
        //  '150: '
        const delim = isUsingOldArrivalTimes ? oldTimeDelim : routeDelims[i];
        screenSections.push((routeName + delim).padEnd(4, ' '));

        // For each arrival time, usually 2 or 3, push a start-padded "minutes-
        // 'till" section to 3 chars, e.g.,
        //  '120'
        //  ' 35'
        //  '  1'
        //  ' -3'
        upcomingArrivalTimes.forEach(upcomingArrival => {
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
};
