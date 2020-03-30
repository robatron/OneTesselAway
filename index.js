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
const {
    updateArrivalInfoUntilStopped,
} = require('./src/oba-api/ArrivalsAPIUtils');
const constants = require('./src/Constants');
const { emitEvent, initEvents } = require('./src/EventUtils');
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
        lcdScreenLines: getState('lcdScreenLines'),
    });
});

// Endpoint that returns OneBusAway arrival example responses for testing
app.get('/eg-oba-api-response/:stopId/:exampleResponse', (req, res) => {
    const stopId = req.params.stopId;
    const egRespName =
        stopId === constants.TARGET_ROUTES[constants.PRIMARY_ROUTE].stopId
            ? req.params.exampleResponse
            : 'default';
    const egRespPath = `${__dirname}/src/oba-api/example-responses/${stopId}/${egRespName}.json`;

    log.info(`Returning example OneBusAway response from "${egRespPath}"`);

    const egResp = require(egRespPath);
    res.json(egResp);
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
        isDeviceEnabled: DEVICE_ENABLED,
        pinsAndPorts: constants.PINS_AND_PORTS,
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

    // Wait for the first arrival info to return before starting up, then
    // continue to fetch at the specified interval
    const stopUpdatingArrivalInfo = await updateArrivalInfoUntilStopped(
        constants.API_UPDATE_INTERVAL,
    );

    // Start up web UI server
    server.listen(constants.WEB_UI_PORT);
    log.info(
        `Web UI server address: ${constants.WEB_UI_ADDRESS}:${constants.WEB_UI_PORT}`,
    );

    // Shut down everything on ^C
    process.on('SIGINT', () => {
        log.info('Shutting down...');
        stopUpdatingArrivalInfo();
        server.close();
        process.exit(0);
    });
})();
