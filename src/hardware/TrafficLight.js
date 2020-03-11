const five = require('johnny-five');
const { wait } = require('../AsyncRepeatUtils');
const constants = require('../Constants');

const goCycleDelay = 100;
const leds = {
    ready: null,
    set: null,
    miss: null,
};

const initTrafficLight = ({ ledReadyPin, ledSteadyPin, ledMissPin }) => {
    leds.ready = new five.Led(ledReadyPin);
    leds.set = new five.Led(ledSteadyPin);
    leds.miss = new five.Led(ledMissPin);
};

// Enable one of the traffic light states. The special state 'go' means to set state of all at once.
const setTrafficLightState = ({ stateId, state }) => {
    Object.keys(leds).forEach(led => {
        leds[led].off();
    });

    if (stateId === 'go') {
        Object.keys(leds).forEach(led => {
            leds[led][state]();
        });
    } else {
        leds[stateId][state]();
    }
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
    setTrafficLightState,
};
