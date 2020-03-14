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

// What route should be considered primary? Used for stoplight and alarm
module.exports.PRIMARY_ROUTE = '1_100009';

// How often to request updates from OneBusAway
module.exports.API_UPDATE_INTERVAL = 5000;

// OneBusAway API endpoint for "arrivals" data at a stop
module.exports.API_ARRIVALS_AND_DEPARTURES_FOR_STOP = `http://api.pugetsound.onebusaway.org/api/where/arrivals-and-departures-for-stop`;

// Log file path
module.exports.LOGFILE = __dirname + '/../logs/device.log';

// Server settings. If started locally w/ `npm start`, it'll serve from
// localhost. If running on the Tessel 2, it'll run from its WiFi IP
module.exports.PORT = process.env.PORT || 8080;
module.exports.ADDRESS = `http://${process.env.ADDR ||
    (os &&
        os.networkInterfaces &&
        os.networkInterfaces() &&
        os.networkInterfaces().wlan0 &&
        os.networkInterfaces().wlan0[0] &&
        os.networkInterfaces().wlan0[0].address) ||
    '0.0.0.0'}`;

// Time ranges for each stoplight state. Ranges minutes from (inclusive) and to (exclusive)
module.exports.STOPLIGHT_TIME_RANGES = {
    ready: [5, Infinity],
    set: [3, 5],
    go: [1, 3],
    miss: [-Infinity, 1],
};

// HARDWARE CONSTANTS --------------------------------------------------

// How often to refresh the hardware
module.exports.HARDWARE_UPDATE_INTERVAL = 1000;

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
module.exports.LED_MISS_PIN = 'b4';
module.exports.LED_ALARM_STATUS_PIN = 'b5';
