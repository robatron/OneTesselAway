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

// Enable one of the traffic light states
const setTrafficLightState = stateId => {
    Object.keys(leds).forEach(led => {
        leds[led].off();
    });

    if (stateId === 'go') {
        const stateList = Object.keys(leds);
        // TODO: Cycle forever
        cycleStates({
            cycleCount:
                (constants.HARDWARE_UPDATE_INTERVAL / stateList.length) *
                goCycleDelay,
            cycleDelay: goCycleDelay,
            stateList,
        });
    } else {
        leds[stateId].on();
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
