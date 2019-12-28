var Express = require('express');
var five = require('johnny-five');
var http = require('http');
var os = require('os');
var path = require('path');
var Tessel = require('tessel-io');
var pug = require('pug');

// Settings ------------------------------------------------------------

// Server settings
const PORT = process.env.PORT || 80;
const ADDRESS = `http://${os.networkInterfaces().wlan0[0].address}`;

// Default messages
const DEFAULT_MESSAGE =
    'America is an irradiated wasteland. Within it lies a city. Outside the boundary walls, a desert. A cursed earth. Inside the walls, a cursed city, stretching from Boston to Washington D.C. An unbroken concrete landscape. 800 million people living in the ruin of the old world and the mega structures of the new one. Mega blocks. Mega highways. Mega City One. Convulsing. Choking. Breaking under its own weight. Citizens in fear of the street. The gun. The gang. Only one thing fighting for order in the chaos: the men and women of the Hall of Justice. Juries. Executioners. Judges.';
const MARINE_MESSAGE =
    "What the fuck did you just fucking say about me, you little bitch? I'll have you know I graduated top of my class in the Navy Seals, and I've been involved in numerous secret raids on Al-Quaeda, and I have over 300 confirmed kills. I am trained in gorilla warfare and I'm the top sniper in the entire US armed forces. You are nothing to me but just another target. I will wipe you the fuck out with precision the likes of which has never been seen before on this Earth, mark my fucking words. You think you can get away with saying that shit to me over the Internet? Think again, fucker. As we speak I am contacting my secret network of spies across the USA and your IP is being traced right now so you better prepare for the storm, maggot. The storm that wipes out the pathetic little thing you call your life. You're fucking dead, kid. I can be anywhere, anytime, and I can kill you in over seven hundred ways, and that's just with my bare hands. Not only am I extensively trained in unarmed combat, but I have access to the entire arsenal of the United States Marine Corps and I will use it to its full extent to wipe your miserable ass off the face of the continent, you little shit. If only you could have known what unholy retribution your little \"clever\" comment was about to bring down upon you, maybe you would have held your fucking tongue. But you couldn't, you didn't, and now you're paying the price, you goddamn idiot. I will shit fury all over you and you will drown in it. You're fucking dead, kiddo.";

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

// Use the pug templating engine
app.set('view engine', 'pug');

// Allow us to parse JSON requests
app.use(Express.urlencoded({ extended: true }));
app.use(Express.json());

// Static server for static files
app.use('/static', Express.static(path.join(__dirname, '/public')));

// Web UI
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Hey',
        message: 'Hello there!',
    });
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
