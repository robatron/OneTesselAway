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
const { getUpcomingArrivalTimes } = require('./src/ArrivalsAndStops');
const { getLatestLogFromFile, initLogger } = require('./src/Logger');

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
const UPDATE_INTERVAL = 1000;

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

    await getUpdatedArrivalInfo(TARGET_ROUTES);

    res.render('index', {
        arrivalInfo: JSON.stringify(arrivalInfo, null, 2),
        logs: getLatestLogFromFile(LOGFILE, { reverseLines: true }),
    });
});

// Start ---------------------------------------------------------------

// Main arrival info cache
let arrivalInfo = {};

// Updates the arrival info in memory. If an update fails, log an error
// and move on.
const getUpdatedArrivalInfo = async targetRoutes => {
    log.info('Updating arrival info...');

    const targetRouteIds = Object.keys(targetRoutes);

    for (let i = 0; i < targetRouteIds.length; ++i) {
        const currentDate = new Date();
        const routeId = targetRouteIds[i];
        const routeName = targetRoutes[routeId].routeName;
        const stopId = targetRoutes[routeId].stopId;
        const stopName = targetRoutes[routeId].stopName;
        let upcomingArrivalTimes;

        try {
            upcomingArrivalTimes = await getUpcomingArrivalTimes(
                stopId,
                routeId,
                currentDate,
            );
        } catch (e) {
            log.error(
                `Failed to get upcoming arrival times for route ${routeId} and stop ${stopId}: ${e.toString()}`,
            );
        }

        if (upcomingArrivalTimes) {
            arrivalInfo[routeId] = {
                lastUpdatedDate: currentDate,
                routeName,
                stopName,
                upcomingArrivalTimes,
            };
        }
    }
};

// Start up web UI server
server = app.listen(PORT);
log.info(`OneTesselAway web server running on: ${ADDRESS}:${PORT}`);

// Close server on ^C
process.on('SIGINT', () => {
    server.close();
});
