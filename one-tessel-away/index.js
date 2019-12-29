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
var five = require('johnny-five');
var Tessel = require('tessel-io');

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
const PORT = process.env.PORT || 80;
const ADDRESS = `http://${os.networkInterfaces().wlan0[0].address}`;

// Default messages
const DEFAULT_MESSAGE = 'OneBusAway Display!';

// LCD screen line length
const LINE_LENGTH = 16;

// Init ----------------------------------------------------------------

// Express server
var app = new Express();
var router = Express.Router();
var server = new http.Server(app);

// Tessel hardware
var board = new five.Board({ io: new Tessel() });

// Setup ---------------------------------------------------------------

// Web UI
app.get('/', (req, res) => {
    res.body = 'Sup';
});

// API routes
app.use('/api', router);

router.get('/message', (req, res) => {
    const msg = getCurrentMessage();
    console.log(`${req.method} ${req.path}: ${msg.slice(0, 20)}...`);
    res.json({ message: msg });
});

router.post('/message', (req, res) => {
    const msg = req.body.newMessage;
    setCurrentMessage(msg);
    resetCurrentLine();
    console.log(`${req.method} ${req.path}: ${msg.slice(0, 20)}...`);
    res.json({ message: msg });
});

// Start ---------------------------------------------------------------

// Globals
let currentMessage = DEFAULT_MESSAGE;
let currentLine = 0;

// Global getters/setters to avoid closures
const getCurrentMessage = () => currentMessage;
const setCurrentMessage = newMessage => {
    currentMessage = newMessage;
};
const getCurrentLine = () => currentLine;
const setCurrentLine = newCurrentLine => {
    currentLine = newCurrentLine;
};
const resetCurrentLine = () => {
    currentLine = 0;
};

board.on('ready', () => {
    const lcd = new five.LCD({
        pins: ['a2', 'a3', 'a4', 'a5', 'a6', 'a7'],
    });

    board.loop(2000, () => {
        const message = getCurrentMessage().concat(' '.repeat(LINE_LENGTH * 2));

        const lines = [
            message.slice(getCurrentLine(), getCurrentLine() + LINE_LENGTH),
            message.slice(
                getCurrentLine() + LINE_LENGTH,
                getCurrentLine() + LINE_LENGTH * 2,
            ),
        ];

        lines.forEach((line, i) => {
            lcd.cursor(i, 0).print(line);
        });

        setCurrentLine(getCurrentLine() + LINE_LENGTH * 2);

        if (getCurrentLine() + LINE_LENGTH * 2 > message.length) {
            resetCurrentLine();
        }

        console.log('>>> line 0: ', lines[0]);
        console.log('>>> line 1: ', lines[1]);
        console.log('>>> curLine:', getCurrentLine());
        console.log('------------');
    });

    // Start up server
    server = app.listen(PORT);
    console.log(`Markee server running on: ${ADDRESS}:${PORT}`);

    process.on('SIGINT', () => {
        server.close();
    });
});
