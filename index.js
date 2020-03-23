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
const express = require('express');
const constants = require('./src/Constants');
const { emitEvent, initEvents, onEvent } = require('./src/EventUtils');
const { initLogger } = require('./src/Logger');
const { initSharedStore, setState } = require('./src/SharedStore');
const { initHardware } = require('./src/hardware');
const { updateLcdScreen } = require('./src/hardware/LcdScreen');
const {
    getDeviceState,
    processDeviceStateForDisplay,
} = require('./src/DeviceState');
const { updateArrivalInfo } = require('./src/ArrivalsAPIUtils');

// Helper Functions / Data -----------------------------------------------------

// Update arrivals from API and hardware from state
const updateArrivalsAndHardware = async () => {
    // Fetch a new arrival info synchronously
    await updateArrivalInfo(constants.TARGET_ROUTES);

    // Grab the updated device state
    const currentDeviceState = getDeviceState();

    // Update LCD. Do last b/c it's very slow.
    updateLcdScreen(currentDeviceState.displayLines);

    // Send device state to the Web UI
    emitEvent(
        'deviceStateUpdated',
        processDeviceStateForDisplay(currentDeviceState),
    );
};

// Initialize ------------------------------------------------------------------

// Set up logger
const log = initLogger(constants.LOGFILE);

log.info('Initializing OneTesselAway...');

// Should we enable the device, or run in web-only mode?
const DEVICE_ENABLED = process.env.DISABLE_DEVICE !== '1';

// Set up Express server for the web UI
const app = express();
const server = new http.Server(app);

// Set up the templating engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Set up static file middleware
app.use('/static', express.static(__dirname + '/views/static'));

// Set up event system for sending data to the Web UI w/o refreshing the page
initEvents(server);

// Route to index. Render initial Web UI server-side.
app.get('/', (req, res) => {
    log.info(
        `IP address ${req.ip} requesting ${req.method} from path ${req.url}`,
    );
    const currentDeviceState = getDeviceState();
    res.render('index', {
        ...processDeviceStateForDisplay(currentDeviceState),

        // Supply the constants file to the Web UI to make hardware simulation
        // easier
        jsConstants: `<script>const constants = ${JSON.stringify(
            constants,
            null,
            2,
        )}</script>`,
    });
});

// Init shared store for the server and the web UI
initSharedStore();

// Start -----------------------------------------------------------------------

// Initialize hardware and set up update loop. Needs to be wrapped in an async
// function to assure hardware is initialized and initial data is fetched
// before starting
(async () => {
    if (DEVICE_ENABLED) {
        log.info('Initializing hardware...');
    } else {
        log.info('Hardware is DISABLED, starting Web UI only...');
    }

    // Initialize all hardware, even when in "web-only" mode
    await initHardware({
        buttonAlarmTogglePin: constants.BUTTON_ALARM_PIN,
        isDeviceEnabled: DEVICE_ENABLED,
        lcdPins: constants.LCD_DISPLAY_PINS,
        ledAlarmStatusPin: constants.LED_ALARM_STATUS_PIN,
        ledMissPin: constants.LED_MISS_PIN,
        ledReadyPin: constants.LED_READY_PIN,
        ledSteadyPin: constants.LED_SET_PIN,
        piezoPin: constants.PIEZO_PIN,
        piezoPort: constants.PIEZO_PORT,
    });

    // Begin updating arrival info and LCD screen regularly
    log.info('Starting OneTesselAway...');
    log.info(
        `Begin updating arrival info ${
            DEVICE_ENABLED ? 'and LCD screen ' : ''
        }every ${constants.API_UPDATE_INTERVAL} milliseconds`,
    );

    if (DEVICE_ENABLED) {
        updateLcdScreen(['Getting bus', 'arrival info...']);
    }

    // Wait for the first arrival info to return before starting up
    await updateArrivalInfo();

    // After the initial API fetch, continue updating asynchronously
    const apiIntervalId = setInterval(
        updateArrivalInfo,
        constants.API_UPDATE_INTERVAL,
    );

    // Start up web UI server
    server.listen(constants.PORT);
    log.info(`Web UI server address: ${constants.ADDRESS}:${constants.PORT}`);

    // Shut down everything on ^C
    process.on('SIGINT', () => {
        log.info('Shutting down...');
        clearInterval(apiIntervalId);
        server.close();
        process.exit(0);
    });
})();
