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

// Settings ------------------------------------------------------------

// Which routes and stops we're interested in, keyed by route ID.
const TARGET_ROUTES = {
    '1_100009': {
        leaveMinGo: 2,
        leaveMinReady: 5,
        routeName: '11',
        stopId: '1_12351',
        stopName: 'E Madison St & 22nd Ave E',
    },
    '1_100018': {
        leaveMinGo: 5,
        leaveMinReady: 8,
        routeName: '12',
        stopId: '1_12353',
        stopName: 'E Madison St & 19th Ave',
    },
};

// How often to request updates from OneBusAway (in milliseconds)
const UPDATE_INTERVAL = 3000;

// Log file path
const LOGFILE = './logs/device.log';

// Server settings. If started locally w/ `npm start`, it'll serve from
// localhost. If running on the Tessel 2, it'll run from its WiFi IP
const PORT = process.env.PORT || 8080;
const ADDRESS = `http://${process.env.ADDR ||
    os.networkInterfaces().wlan0[0].address}`;

// Setup ---------------------------------------------------------------

// Set up logger
const log = initLogger(LOGFILE);

// Set up Express server for the web UI
var app = new Express();
var server = new http.Server(app);

// Set up the templating engine
app.set('view engine', 'ejs');

// Route to index
app.get('/', async (req, res) => {
    log.info(
        `IP address ${req.ip} requesting ${req.method} from path ${req.url}`,
    );

    const arrivalInfo = JSON.stringify(getArrivalInfo(), null, 2);
    const deviceLogs = getLatestLogFromFile(LOGFILE, { reverseLines: true });
    const displayLines = arrivalInfoToDisplayLines(getArrivalInfo()).join('\n');

    res.render('index', {
        arrivalInfo,
        deviceLogs,
        displayLines,
    });
});

// Start ---------------------------------------------------------------
log.info('Starting OneTesselAway...');

if (process.env.WEB_ONLY === '1') {
    log.info('Running in WEB-ONLY mode. Skipping device initialization.');
} else {
    log.info('Initializing device...');
    // TODO: Actual device setup
}

// Begin updating arrival info regularly
log.info(`Begin updating arrival info every ${UPDATE_INTERVAL} milliseconds`);
const updateInterval = setInterval(
    () => updateArrivalInfo(TARGET_ROUTES),
    UPDATE_INTERVAL,
);
updateArrivalInfo.bind(TARGET_ROUTES);

// Start up web UI server
server = app.listen(PORT);
log.info(`Web server running on: ${ADDRESS}:${PORT}`);

// Shut down everything on ^C
process.on('SIGINT', () => {
    clearInterval(updateInterval);
    server.close();
});
