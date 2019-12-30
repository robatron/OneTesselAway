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
 * Supports up to two routes and two stops.
 */
const http = require('http');
const os = require('os');
const fs = require('fs');
const { createLogger, transports } = require('winston');
const { format } = require('logform');
const Express = require('express');

const { getUpcommingArrivalTimes } = require('./src/ArrivalsAndStops');

// Settings ------------------------------------------------------------

// Which stops and routes to track
const ROUTES_AND_STOPS = [
    {
        leaveMinGo: 2,
        leaveMinReady: 5,
        routeId: '1_100009',
        routeName: '11',
        stopId: '1_12351',
        stopName: 'E Madison St & 22nd Ave E',
    },
    {
        leaveMinGo: 5,
        leaveMinReady: 8,
        routeId: '1_100018',
        routeName: '12',
        stopId: '1_12353',
        stopName: 'E Madison St & 19th Ave',
    },
];

// How often to request updates from OneBusAway (in milliseconds)
const UPDATE_INTERVAL = 1000;

// Server settings. If started locally w/ `npm start`, it'll serve from
// localhost. If running on the Tessel 2, it'll run from its WiFi IP
const PORT = process.env.PORT || 8080;
const ADDRESS = `http://${process.env.ADDR ||
    os.networkInterfaces().wlan0[0].address}`;

// Setup ---------------------------------------------------------------

// Set up logger
const LATEST_LOGFILE = './logs/app.log';
const log = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.printf(
            info =>
                `${info.timestamp} [${info.level}] ${info.message} ${
                    info.stack ? '\n' + info.stack : ''
                }`,
        ),
    ),
    transports: [
        new transports.File({
            filename: './logs/app.log',
            maxFiles: 10,
            maxsize: 1024 * 100, // 100 KiB
            tailable: true,
        }),
        new transports.Console(),
    ],
});

// Set up Express server for the web UI
var app = new Express();
var server = new http.Server(app);

// Set up the templating engine
app.set('view engine', 'ejs');

// Route to index
app.get('/', async (req, res) => {
    const callTimeMsEpoch = Date.now();
    let arrivalInfo;

    log.info("Getting '/' ... ");

    try {
        arrivalInfo = await getUpdatedArrivalInfo(
            ROUTES_AND_STOPS,
            callTimeMsEpoch,
        );
    } catch (e) {
        log.error(e);
    }

    res.render('index', {
        arrivalInfo: JSON.stringify(arrivalInfo, null, 2),
        logs: fs.readFileSync(LATEST_LOGFILE),
        updateTime: new Date(callTimeMsEpoch),
    });
});

// Start ---------------------------------------------------------------

const getUpdatedArrivalInfo = async (routesAndStops, callTimeMsEpoch) => {
    const updatedInfo = [];

    for (let i = 0; i < routesAndStops.length; ++i) {
        const routeId = routesAndStops[i].routeId;
        const routeName = routesAndStops[i].routeName;
        const stopId = routesAndStops[i].stopId;
        const stopName = routesAndStops[i].stopName;

        updatedInfo.push({
            stopName,
            routeName,
            upcommingArrivalTimes: await getUpcommingArrivalTimes(
                stopId,
                routeId,
                callTimeMsEpoch,
            ),
        });
    }

    return updatedInfo;
};

// Start up web UI server
server = app.listen(PORT);
log.info(`OneTesselAway web server running on: ${ADDRESS}:${PORT}`);

// Close server on ^C
process.on('SIGINT', () => {
    server.close();
});
