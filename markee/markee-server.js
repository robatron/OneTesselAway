var Express = require('express');
var five = require('johnny-five');
var http = require('http');
var os = require('os');
var path = require('path');
var Tessel = require('tessel-io');

// Settings ------------------------------------------------------------

const PORT = process.env.PORT || 3000;
const ADDRESS = `http://${os.networkInterfaces().wlan0[0].address}`;

// Init ----------------------------------------------------------------

// Express server
var app = new Express();
var router = Express.Router();
var server = new http.Server(app);

// Tessel hardware
var board = new five.Board({ io: new Tessel() });

// Setup ---------------------------------------------------------------

// Static server for web interface
app.use('/static', Express.static(path.join(__dirname, '/app')));

// API routes
app.use('/api', router);

router.get('/', (req, res) => {
    res.json({ message: 'hooray! welcome to our api!' });
});

// Start ---------------------------------------------------------------

board.on('ready', () => {
    app.listen(PORT);
    console.log(`Markee server running on: ${ADDRESS}:${PORT}`);

    process.on('SIGINT', () => {
        server.close();
    });
});
