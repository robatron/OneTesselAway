const five = require('johnny-five');
const { wait } = require('../AsyncRepeatUtils');

const strobeDelay = 1000;

const leds = {
    ready: null,
    set: null,
    go: null,
};

const initTrafficLight = ({ ledReadyPin, ledSteadyPin, ledGoPin }) => {
    leds.ready = new five.Led(ledReadyPin);
    leds.set = new five.Led(ledSteadyPin);
    leds.go = new five.Led(ledGoPin);
};

// Turn on one of the traffic lights, turn all others off
const setState = stateId => {
    Object.keys(leds).forEach(led => {
        leds[led].stop().off();
    });
    leds[stateId].strobe(strobeDelay);
};

// Cycle through a list of states
const cycleStates = async ({ cycleCount, cycleDelay, stateList }) => {
    for (ii = 0; ii < cycleCount; ++ii) {
        for (i = 0; i < stateList.length; ++i) {
            stateList.forEach(stateId => {
                leds[stateId].off();
            });
            leds[stateList[i]].on();
            await wait(cycleDelay);
        }
    }
    stateList.forEach(stateId => {
        leds[stateId].off();
    });
};

module.exports = {
    cycleStates,
    getLeds: () => leds,
    initTrafficLight,
    setState,
};
