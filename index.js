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
const Express = require('express');
const { getLatestLogFromFile, initLogger } = require('./src/Logger');
const { getArrivalInfo, updateArrivalInfo } = require('./src/ArrivalStore');
const { getLcdDisplayLines } = require('./src/DisplayUtils');
const { fireAndRepeat } = require('./src/AsyncRepeatUtils');
const constants = require('./src/Constants');

// Helper Functions / Data -----------------------------------------------------

// Get the current device state, used to render the Web UI data, and update the
// LCD screen
const getDeviceState = () => {
    const arrivalInfo = getArrivalInfo();
    const deviceLogs = getLatestLogFromFile(constants.LOGFILE, {
        reverseLines: true,
    });
    const displayLines = getLcdDisplayLines(arrivalInfo);

    const closestMinsUntilArrival =
        arrivalInfo[constants.PRIMARY_ROUTE].upcomingArrivalTimes[0]
            .minsUntilArrival;
    const stoplightStates = Object.keys(constants.STOPLIGHT_TIME_RANGES);

    let stoplightState;
    for (let i = 0; stoplightStates.length; ++i) {
        const curStoplightState = stoplightStates[i];
        const curStoplightStateRange =
            constants.STOPLIGHT_TIME_RANGES[curStoplightState];
        if (
            closestMinsUntilArrival >= curStoplightStateRange[0] &&
            closestMinsUntilArrival < curStoplightStateRange[1]
        ) {
            stoplightState = curStoplightState;
            break;
        }
    }

    return {
        arrivalInfo,
        deviceLogs,
        displayLines,
        stoplightState,
    };
};

// Processes device state for use within the Web UI
const processDeviceStateForDisplay = deviceState => ({
    ...deviceState,
    arrivalInfo: JSON.stringify(deviceState.arrivalInfo, null, 2),
    displayLines: deviceState.displayLines.join('\n'),
});

// Update arrival info from OneBusAway, update the Web UI, and finally update
// LCD screen if the hardware is enabled
const fetchArrivalInfoAndUpdateDisplay = async () => {
    await updateArrivalInfo(constants.TARGET_ROUTES);
    const currentDeviceState = getDeviceState();

    // Send device state to the Web UI
    io.emit(
        'deviceStateUpdated',
        processDeviceStateForDisplay(currentDeviceState),
    );

    // Update the LCD display if hardware is enabled
    if (DEVICE_ENABLED) {
        updateLcdScreen(currentDeviceState.displayLines);
    }
};

// Initialize ------------------------------------------------------------------

// Set up logger
const log = initLogger(constants.LOGFILE);

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
    res.render('index', processDeviceStateForDisplay(currentDeviceState));
});

// Start -----------------------------------------------------------------------

// Initialize hardware and set up update loop. Needs to be wrapped in an async
// function to assure hardware is initialized and initial data is fetched
// before starting
(async () => {
    // Track the main program loop interval ID so we can kill it on command
    let intervalId;

    if (DEVICE_ENABLED) {
        log.info('Initializing hardware device...');
        await initHardware({
            buttonAlarmTogglePin: constants.BUTTON_ALARM_PIN,
            lcdPins: constants.LCD_DISPLAY_PINS,
            ledAlarmStatusPin: constants.LED_ALARM_STATUS_PIN,
            ledGoPin: constants.LED_GO_PIN,
            ledReadyPin: constants.LED_READY_PIN,
            ledSteadyPin: constants.LED_SET_PIN,
            piezoPin: constants.PIEZO_PIN,
            piezoPort: constants.PIEZO_PORT,
        });
    } else {
        log.info('Hardware device DISABLED. Starting web UI only...');
    }

    // Begin updating arrival info and LCD screen regularly
    log.info('Starting OneTesselAway...');
    log.info(
        `Begin updating arrival info ${
            DEVICE_ENABLED ? 'and LCD screen ' : ''
        }every ${constants.UPDATE_INTERVAL} milliseconds`,
    );

    if (DEVICE_ENABLED) {
        updateLcdScreen(['Getting bus', 'arrival info...']);
    }

    await fireAndRepeat(
        constants.UPDATE_INTERVAL,
        fetchArrivalInfoAndUpdateDisplay,
        iid => (intervalId = iid),
    );

    // Start up web UI server
    server = server.listen(constants.PORT);
    log.info(`Web UI server address: ${constants.ADDRESS}:${constants.PORT}`);

    // Shut down everything on ^C
    process.on('SIGINT', () => {
        log.info('Shutting down...');
        clearInterval(intervalId);
        server.close();
    });
})();
