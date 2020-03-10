const five = require('johnny-five');

let ledReady;
let ledSet;
let ledGo;

const initTrafficLight = ({ ledReadyPin, ledSetPin, ledGoPin }) => {
    ledReady = new five.Led(ledReadyPin);
    ledSet = new five.Led(ledSetPin);
    ledGo = new five.Led(ledGoPin);
};

module.exports = {
    initTrafficLight,
};
