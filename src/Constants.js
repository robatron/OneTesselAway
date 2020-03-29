// Constants for configuring the behavior of the OneTesselAway device

const os = require('os');

// SOFTWARE CONSTANTS ----------------------------------------------------------

// Which routes and stops we're interested in, keyed by route ID
module.exports.TARGET_ROUTES = {
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

// What route should be considered primary? The stoplight LEDs and alarm will
// reflect this route.
module.exports.PRIMARY_ROUTE = '1_100009';

// OneBusAway API endpoint for "arrivals" data at a stop
module.exports.API_ARRIVALS_AND_DEPARTURES_FOR_STOP = `http://api.pugetsound.onebusaway.org/api/where/arrivals-and-departures-for-stop`;

// How often (in ms) to request updates from the OneBusAway API
module.exports.API_UPDATE_INTERVAL = 5000;

// How long to wait (in ms) between back-to-back calls to the OneBusAway API in
// a single update to avoid hitting the rate limit
module.exports.API_CONSECUTIVE_FETCH_PADDING = 500;

// Path to the log file
module.exports.LOGFILE = __dirname + '/../logs/device.log';

// Server settings. If started locally in "web only" mode w/ `npm start`, it'll
// serve from localhost. If running on the Tessel 2, it'll run from its WiFi IP
module.exports.PORT = process.env.PORT || 8080;
module.exports.ADDRESS = `http://${process.env.ADDR ||
    (os &&
        os.networkInterfaces &&
        os.networkInterfaces() &&
        os.networkInterfaces().wlan0 &&
        os.networkInterfaces().wlan0[0] &&
        os.networkInterfaces().wlan0[0].address) ||
    '0.0.0.0'}`;

// All possible stoplight states
module.exports.STOPLIGHT_STATES = {
    READY: 'ready',
    STEADY: 'steady',
    GO: 'go',
    MISS: 'miss',
};

// Names of the individual LEDs correspond 1:1 to states excluding 'go', which
// is a multi-LED state
module.exports.STOPLIGHT_LED_NAMES = [
    module.exports.STOPLIGHT_STATES.READY,
    module.exports.STOPLIGHT_STATES.STEADY,
    module.exports.STOPLIGHT_STATES.MISS,
];

// Time ranges for each stoplight state. Ranges are minutes from (inclusive) and
// to (exclusive). E.g., it's a 'go' state if the primary route is 1 or 2
// minutes away.
module.exports.STOPLIGHT_TIME_RANGES = {
    [module.exports.STOPLIGHT_STATES.READY]: [5, Infinity],
    [module.exports.STOPLIGHT_STATES.STEADY]: [3, 5],
    [module.exports.STOPLIGHT_STATES.GO]: [1, 3],
    [module.exports.STOPLIGHT_STATES.MISS]: [-Infinity, 1],
};

// HARDWARE CONSTANTS ----------------------------------------------------------

// Pin for the button for the alarm. The pin must be a pull-up or pull-down pin:
// https://tessel.gitbooks.io/t2-docs/content/API/Hardware_API.html#pull-up-and-pull-down-pins
module.exports.BUTTON_ALARM_PIN = 'a4';

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
module.exports.PIEZO_PORT = 'A';
module.exports.PIEZO_PIN = 6;

// Pins for the LCD display for use with the j5 API:
// http://johnny-five.io/api/lcd/
module.exports.LCD_DISPLAY_PINS = ['b2', 'b3', 'b4', 'b5', 'b6', 'b7'];

// Pins for the stoplight status LEDs
module.exports.LED_READY_PIN = 'a7'; // Green LED
module.exports.LED_SET_PIN = 'a2'; // Yellow LED
module.exports.LED_MISS_PIN = 'a1'; // Red LED

// Pin for the alarm status LED (blue)
module.exports.LED_ALARM_STATUS_PIN = 'a3';
