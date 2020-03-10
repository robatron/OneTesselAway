const five = require('johnny-five');

const strobeDelay = 1000;

let ledReady;
let ledSteady;
let ledGo;

const initTrafficLight = ({ ledReadyPin, ledSteadyPin, ledGoPin }) => {
    ledReady = new five.Led(ledReadyPin);
    ledSteady = new five.Led(ledSteadyPin);
    ledGo = new five.Led(ledGoPin);
};

// Turn on one of the traffic lights, mutually exclusive
const setReadyState = () => {
    ledReady.strobe(strobeDelay);
    ledSteady.stop().off();
    ledGo.stop().off();
};

const setSteadyState = () => {
    ledReady.stop().off();
    ledSteady.strobe(strobeDelay);
    ledGo.stop().off();
};

const setGoState = () => {
    ledReady.stop().off();
    ledSteady.stop().off();
    ledGo.strobe(strobeDelay);
};

module.exports = {
    initTrafficLight,
    setReadyState,
    setSteadyState,
    setGoState,
};
