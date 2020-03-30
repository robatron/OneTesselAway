// Constants for configuring the behavior of the OneTesselAway device

const os = require('os');

// How long to wait (in ms) between back-to-back calls to the OneBusAway API in
// a single update to avoid hitting the rate limit
const API_CONSECUTIVE_FETCH_PADDING = 500;

// How often (in ms) to request updates from the OneBusAway API
const API_UPDATE_INTERVAL = 5000;

// OneBusAway API endpoint for "arrivals" data at a stop
const API_URL = `http://api.pugetsound.onebusaway.org/api/where/arrivals-and-departures-for-stop`;

// Path to the current log file. Logs will be rotated every 100k w/ max 10 files
const LOGFILE = __dirname + '/../logs/device.log';

// References to physical pins and ports on the device
const PINS_AND_PORTS = {
    // Pin for the button for the alarm. The pin must be a pull-up or pull-down pin:
    // https://tessel.gitbooks.io/t2-docs/content/API/Hardware_API.html#pull-up-and-pull-down-pins
    btnAlarmTogglePin: 'a4',

    // Pins for the LCD display for use with the j5 API:
    // http://johnny-five.io/api/lcd/
    lcdPins: ['b2', 'b3', 'b4', 'b5', 'b6', 'b7'],

    // Pin for the alarm status LED (blue)
    ledAlarmStatusPin: 'a3',

    // Pins for the stoplight status LEDs
    ledMissPin: 'a1', // Red LED
    ledReadyPin: 'a7', // Green LED
    ledSteadyPin: 'a2', // Yellow LED

    // Pin for the piezo speaker buzzer. This must be attached to a PWM pin. These
    // pin configs look different than the others b/c they are used w/ the low-level
    // the 'tessel' API. (Not through johnny-five.)
    //
    // Note: There are two pins per port that support PWM, 5 and 6. When the buzzer
    // is connected to one of these pins, do not connect anything else to the other,
    // b/c we end up manipulating all PWM pins simultaneously when playing a tune on
    // the buzzer.
    //
    // See:
    // - https://tessel.gitbooks.io/t2-docs/content/API/Hardware_API.html#pwm-pins
    // - https://tessel.gitbooks.io/t2-docs/content/API/Hardware_API.html#pin-mapping
    piezoPin: 6,
    piezoPort: 'A',
};

// What route should be considered primary? The stoplight LEDs and alarm will
// reflect this route.
const PRIMARY_ROUTE = '1_100009';

// All possible stoplight states
const STOPLIGHT_STATES = {
    READY: 'ready',
    STEADY: 'steady',
    GO: 'go',
    MISS: 'miss',
};

// Names of the individual LEDs correspond 1:1 to states excluding 'go', which
// is a multi-LED state
const STOPLIGHT_LED_NAMES = [
    STOPLIGHT_STATES.READY,
    STOPLIGHT_STATES.STEADY,
    STOPLIGHT_STATES.MISS,
];

// Time ranges for each stoplight state. Ranges are minutes from (inclusive) and
// to (exclusive). E.g., it's a 'go' state if the primary route is 1 or 2
// minutes away.
const STOPLIGHT_TIME_RANGES = {
    [STOPLIGHT_STATES.READY]: [5, Infinity],
    [STOPLIGHT_STATES.STEADY]: [3, 5],
    [STOPLIGHT_STATES.GO]: [1, 3],
    [STOPLIGHT_STATES.MISS]: [-Infinity, 1],
};

// Which routes and stops we're interested in, keyed by route ID
const TARGET_ROUTES = {
    '1_100009': {
        routeName: '11',
        stopId: '1_12351',
        stopName: 'E Madison St & 22nd Ave E',
    },
    '1_100018': {
        routeName: '12',
        stopId: '1_12353',
        stopName: 'E Madison St & 19th Ave',
    },
};

// Web UI server settings. If started locally in "web only" mode w/ `npm start`,
// it'll serve from localhost. If running on the Tessel 2, it'll run from its
// WiFi IP
const WEB_UI_ADDRESS = `http://${process.env.WEB_UI_ADDRESS ||
    (os &&
        os.networkInterfaces &&
        os.networkInterfaces() &&
        os.networkInterfaces().wlan0 &&
        os.networkInterfaces().wlan0[0] &&
        os.networkInterfaces().wlan0[0].address) ||
    '0.0.0.0'}`;
const WEB_UI_PORT = process.env.WEB_UI_PORT || 8080;

module.exports = {
    API_CONSECUTIVE_FETCH_PADDING,
    API_UPDATE_INTERVAL,
    API_URL,
    LOGFILE,
    PINS_AND_PORTS,
    PRIMARY_ROUTE,
    STOPLIGHT_LED_NAMES,
    STOPLIGHT_STATES,
    STOPLIGHT_TIME_RANGES,
    TARGET_ROUTES,
    WEB_UI_ADDRESS,
    WEB_UI_PORT,
};
