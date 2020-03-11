// Constants for configuring the OneTesselAway device

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

// How often to request updates from OneBusAway and update LCD screen
module.exports.UPDATE_INTERVAL = 5000;

// OneBusAway API endpoint for "arrivals" data at a stop
const API_ARRIVALS_AND_DEPARTURES_FOR_STOP = `http://api.pugetsound.onebusaway.org/api/where/arrivals-and-departures-for-stop`;

// Log file path
module.exports.LOGFILE = __dirname + '/../logs/device.log';

// Server settings. If started locally w/ `npm start`, it'll serve from
// localhost. If running on the Tessel 2, it'll run from its WiFi IP
module.exports.PORT = process.env.PORT || 8080;
module.exports.ADDRESS = `http://${process.env.ADDR ||
    os.networkInterfaces().wlan0[0].address}`;

// Time ranges for each stoplight state. Ranges minutes from (inclusive) and to (exclusive)
module.exports.STOPLIGHT_TIME_RANGES = {
    ready: [5, Infinity],
    set: [3, 5],
    go: [2, 3],
    miss: [-Infinity, 2],
};

// HARDWARE CONSTANTS --------------------------------------------------

// Which pins on the Tessel is the hardware plugged into?

// Button needs to be on a pull-up or pull-down pin
// https://tessel.gitbooks.io/t2-docs/content/API/Hardware_API.html#pull-up-and-pull-down-pins
module.exports.BUTTON_ALARM_PIN = 'b7';

// Piezo speaker has to be on a PWM pin. These are low-level values for use w/ the 'tessel' API
// https://tessel.gitbooks.io/t2-docs/content/API/Hardware_API.html#pwm-pins
module.exports.PIEZO_PORT = 'B';
module.exports.PIEZO_PIN = 6;

// LCD display
module.exports.LCD_DISPLAY_PINS = ['a2', 'a3', 'a4', 'a5', 'a6', 'a7'];

// LEDs
module.exports.LED_READY_PIN = 'b2';
module.exports.LED_SET_PIN = 'b3';
module.exports.LED_GO_PIN = 'b4';
module.exports.LED_ALARM_STATUS_PIN = 'b5';
