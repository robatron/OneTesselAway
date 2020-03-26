/**
 * OneTesselAway - OneBusAway for the Tessel 2
 *
 * Display: 2 lines w/ 16 characters each. Example display:
 *
 *  ----------------
 *  11.   03  15  45
 *  12:   18  32  51
 *  ----------------
 *
 * Supports up to two routes and two stops.
 */
const express = require('express');
const http = require('http');
const { updateArrivalInfo } = require('./src/oba-api/ArrivalsAPIUtils');
const constants = require('./src/Constants');
const { emitEvent, initEvents } = require('./src/EventUtils');
const { setState } = require('./src/GlobalState');
const { getLatestLogFromFile, initLogger } = require('./src/Logger');
const { initGlobalState, getState } = require('./src/GlobalState');
const { initHardware } = require('./src/hardware');

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

// Init global state for the server and the web UI
initGlobalState();

// Routing -------------------------------------------------------------

// Route to index. Render initial Web UI server-side.
app.get('/', (req, res) => {
    log.info(
        `IP address ${req.ip} requesting ${req.method} from path ${req.url}`,
    );
    const globalStateJson = JSON.stringify(getState(), null, 2);

    res.render('index', {
        // Supply the device logs on render. Must refresh to get new ones.
        deviceLogs: getLatestLogFromFile(constants.LOGFILE, {
            reverseLines: true,
        }),

        // Supply global state
        globalState: globalStateJson,

        // Inject current global state when the page is rendered server-side
        injectGlobalState: `<script>const globalState = ${globalStateJson}</script>`,

        // Inject constants file to the Web UI to make hardware simulation
        // easier
        injectConstants: `<script>const constants = ${JSON.stringify(
            constants,
            null,
            2,
        )}</script>`,

        // Initial LCD screen contents
        lcdScreenLines: getState().lcdScreenLines,
    });
};);

// Endpoint that returns OneBusAway arrival example responses for testing
app.get('/eg-oba-resp/:exampleResponse', (req, res) => {
    const egRespName = req.params.exampleResponse;
    const egRespPath = `${__dirname}/src/oba-api/example-responses/${egRespName}.json`;

    log.info(`Returning example OneBusAway response from "${egRespPath}"`);

    const egResp = require(egRespPath);

});

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
        emitEvent('printToScreen', ['Getting bus', 'arrival info...']);
    }

    // Wait for the first arrival info to return before starting up
    await updateArrivalInfo();

    // After the initial API fetch, continue updating
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
