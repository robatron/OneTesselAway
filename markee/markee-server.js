var Express = require('express');
var five = require('johnny-five');
var http = require('http');
var os = require('os');
var path = require('path');
var Tessel = require('tessel-io');

// Settings ------------------------------------------------------------

const PORT = process.env.PORT || 3000;
const ADDRESS = `http://${os.networkInterfaces().wlan0[0].address}`;
const DEFAULT_MESSAGE =
    "What the fuck did you just fucking say about me, you little bitch? I'll have you know I graduated top of my class in the Navy Seals, and I've been involved in numerous secret raids on Al-Quaeda, and I have over 300 confirmed kills. I am trained in gorilla warfare and I'm the top sniper in the entire US armed forces. You are nothing to me but just another target. I will wipe you the fuck out with precision the likes of which has never been seen before on this Earth, mark my fucking words. You think you can get away with saying that shit to me over the Internet? Think again, fucker. As we speak I am contacting my secret network of spies across the USA and your IP is being traced right now so you better prepare for the storm, maggot. The storm that wipes out the pathetic little thing you call your life. You're fucking dead, kid. I can be anywhere, anytime, and I can kill you in over seven hundred ways, and that's just with my bare hands. Not only am I extensively trained in unarmed combat, but I have access to the entire arsenal of the United States Marine Corps and I will use it to its full extent to wipe your miserable ass off the face of the continent, you little shit. If only you could have known what unholy retribution your little \"clever\" comment was about to bring down upon you, maybe you would have held your fucking tongue. But you couldn't, you didn't, and now you're paying the price, you goddamn idiot. I will shit fury all over you and you will drown in it. You're fucking dead, kiddo.";

// Init ----------------------------------------------------------------

// Express server
var app = new Express();
var router = Express.Router();
var server = new http.Server(app);

// Tessel hardware
var board = new five.Board({ io: new Tessel() });

// Setup ---------------------------------------------------------------

// Allow us to parse JSON requests
app.use(Express.urlencoded({ extended: true }));
app.use(Express.json());

// Static server for web interface
app.use('/', Express.static(path.join(__dirname, '/public')));

// API routes
app.use('/api', router);

router.get('/message', (req, res) => {
    const msg = getCurrentMessage();
    console.log(`${req.method} ${req.path}: ${msg.slice(0, 20)}...`);
    res.json({ message: msg });
});

router.post('/message', (req, res) => {
    console.log('>>>', req);
    console.log('>>>', req.body);
    const msg = req.body.newMessage;
    setCurrentMessage(msg);
    console.log(`${req.method} ${req.path}: ${msg.slice(0, 20)}...`);
    res.json({ message: msg });
});

// Start ---------------------------------------------------------------

let currentMessage = DEFAULT_MESSAGE;

const getCurrentMessage = () => currentMessage;
const setCurrentMessage = newMessage => {
    currentMessage = newMessage;
};

board.on('ready', () => {
    app.listen(PORT);
    console.log(`Markee server running on: ${ADDRESS}:${PORT}`);

    process.on('SIGINT', () => {
        server.close();
    });
});
