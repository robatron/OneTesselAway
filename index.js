/**
 * OneTesselAway - OneBusAway for the Tessel 2
 *
 * Display: 2 lines w/ 16 characters each. Example display:
 *
 *  ----------------
 *  11! 15:37 15:49
 *  12  08:11 06:47
 *  ----------------
 *
 *  ----------------
 *  11: 03!  15  45
 *  12: 18   32  51
 *  ----------------
 *
 * Supports up to two routes and two stops.
 */
const http = require('http');
const os = require('os');
const Express = require('express');
const { getLatestLogFromFile, initLogger } = require('./src/Logger');
const { getArrivalInfo, updateArrivalInfo } = require('./src/ArrivalStore');
const { arrivalInfoToDisplayLines } = require('./src/DisplayUtils');
const { fireAndRepeat } = require('./src/AsyncRepeatUtils');

// Settings --------------------------------------------------------------------

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

// How often to request updates from OneBusAway and update LCD screen
const UPDATE_INTERVAL = 5000;

// Log file path
const LOGFILE = __dirname + '/logs/device.log';

// Server settings. If started locally w/ `npm start`, it'll serve from
// localhost. If running on the Tessel 2, it'll run from its WiFi IP
const PORT = process.env.PORT || 8080;
const ADDRESS = `http://${process.env.ADDR ||
    os.networkInterfaces().wlan0[0].address}`;

// Which pins on the Tessel is the hardware plugged into?

// Button needs to be on a pull-up or pull-down pin
// https://tessel.gitbooks.io/t2-docs/content/API/Hardware_API.html#pull-up-and-pull-down-pins
const BUTTON_ALARM_PIN = 'b7';

// Piezo speaker has to be on a PWM pin. These are low-level values for use w/ the 'tessel' API
// https://tessel.gitbooks.io/t2-docs/content/API/Hardware_API.html#pwm-pins
const PIEZO_PORT = 'B';
const PIEZO_PIN = 6;

// LCD display
const LCD_DISPLAY_PINS = ['a2', 'a3', 'a4', 'a5', 'a6', 'a7'];

// LEDs
const LED_READY_PIN = 'b4';
const LED_SET_PIN = 'b3';
const LED_GO_PIN = 'b2';
const LED_ALARM_STATUS_PIN = 'b5';

// Helper Functions / Data -----------------------------------------------------

// Neverending interval ID so we can kill it on command
let intervalId;

// Create display lines from arrival info and dynamic delimeters
let getDisplayLinesCount = 0;
const getDisplayLines = () => {
    const arrivalInfo = getArrivalInfo();

    // Animate route delimeter characters, alternating frames between calls
    const routeDelims = [':', '.'];
    if (getDisplayLinesCount % routeDelims.length) {
        routeDelims.reverse();
    }

    const displayLines = arrivalInfoToDisplayLines(arrivalInfo, routeDelims);

    ++getDisplayLinesCount;

    return displayLines;
};

// Get the current device state, used to render the Web UI data, and update the
// LCD screen
const getDeviceState = () => {
    const arrivalInfo = JSON.stringify(getArrivalInfo(), null, 2);
    const deviceLogs = getLatestLogFromFile(LOGFILE, { reverseLines: true });
    const displayLines = getDisplayLines();

    return {
        arrivalInfo,
        deviceLogs,
        displayLines,
        displayLinesJoined: displayLines.join('\n'),
    };
};

// Update arrival info from OneBusAway, update the Web UI, and finally update
// LCD screen if the hardware is enabled
const fetchArrivalInfoAndUpdateDisplay = async () => {
    await updateArrivalInfo(TARGET_ROUTES);
    const currentDeviceState = getDeviceState();

    // Send device state to the Web UI
    io.emit('deviceStateUpdated', currentDeviceState);

    // Update the LCD display if hardware is enabled
    if (DEVICE_ENABLED) {
        updateLcdScreen(currentDeviceState.displayLines);
    }
};

// Initialize ------------------------------------------------------------------

// Set up logger
const log = initLogger(LOGFILE);

log.info('Initializing OneTesselAway...');

// Should we enable the device, or run in web-only mode?
const DEVICE_ENABLED = process.env.DISABLE_DEVICE !== '1';

// Don't try to require the hardware module unless we're running on the actual
// device to prevent global import errors
let initHardware, updateLcdScreen;
if (DEVICE_ENABLED) {
    const hardware = require('./src/hardware');
    const lcdScreen = require('./src/hardware/LcdScreen');
    initHardware = hardware.initHardware;
    updateLcdScreen = lcdScreen.updateLcdScreen;
}

// Set up Express server for the web UI
var app = new Express();
var server = new http.Server(app);

// Set up the templating engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Set up Socket.io for sending data to the Web UI w/o refreshing the page
var io = require('socket.io')(server);

// Route to index. Render initial Web UI server-side.
app.get('/', (req, res) => {
    log.info(
        `IP address ${req.ip} requesting ${req.method} from path ${req.url}`,
    );
    const currentDeviceState = getDeviceState();
    res.render('index', currentDeviceState);
});

// Start -----------------------------------------------------------------------

// Initialize hardware and set up update loop. Needs to be wrapped in an async
// function to assure hardware is initialized and initial data is fetched
// before starting
(async () => {
    if (DEVICE_ENABLED) {
        log.info('Initializing hardware device...');
        await initHardware({
            buttonAlarmTogglePin: BUTTON_ALARM_PIN,
            lcdPins: LCD_DISPLAY_PINS,
            ledAlarmStatusPin: LED_ALARM_STATUS_PIN,
            ledGoPin: LED_GO_PIN,
            ledReadyPin: LED_READY_PIN,
            ledSetPin: LED_SET_PIN,
            piezoPin: PIEZO_PIN,
            piezoPort: PIEZO_PORT,
        });
    } else {
        log.info('Hardware device DISABLED. Starting web UI only...');
    }

    // Begin updating arrival info and LCD screen regularly
    log.info('Starting OneTesselAway...');
    log.info(
        `Begin updating arrival info ${
            DEVICE_ENABLED ? 'and LCD screen ' : ''
        }every ${UPDATE_INTERVAL} milliseconds`,
    );
    if (DEVICE_ENABLED) {
        updateLcdScreen(['Getting bus', 'arrival info...']);
    }
    await fireAndRepeat(
        UPDATE_INTERVAL,
        fetchArrivalInfoAndUpdateDisplay,
        iid => (intervalId = iid),
    );

    // Start up web UI server
    server = server.listen(PORT);
    log.info(`Web UI server address: ${ADDRESS}:${PORT}`);

    // Shut down everything on ^C
    process.on('SIGINT', () => {
        log.info('Shutting down...');
        clearInterval(intervalId);
        server.close();
    });
})();
