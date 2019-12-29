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
var http = require('http');
var os = require('os');
var Express = require('express');

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

// Server settings
const PORT = process.env.PORT || 8080;
const ADDRESS = `http://${process.env.ADDR ||
    os.networkInterfaces().wlan0[0].address}`;

// Init ----------------------------------------------------------------

// Express server
var app = new Express();
var server = new http.Server(app);

// Setup ---------------------------------------------------------------

// Set up the templating engine
app.set('view engine', 'ejs');

// Web UI
app.get('/', (req, res) => {
    res.render('index', { title: 'Hey', message: 'Hello there!' });
});

// Start ---------------------------------------------------------------

// Start up web UI server
server = app.listen(PORT);
console.log(`OneTesselAway web server running on: ${ADDRESS}:${PORT}`);

process.on('SIGINT', () => {
    server.close();
});
