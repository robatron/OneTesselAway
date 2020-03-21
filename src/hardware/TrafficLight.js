const five = require('johnny-five');
const { wait } = require('../AsyncRepeatUtils');
const constants = require('../Constants');
const { emitEvent, onEvent } = require('../EventUtils');
const { setState } = require('../SharedStore');

const strobeDuration = 1000;
const leds = {
    [constants.STOPLIGHT_STATES.READY]: null,
    [constants.STOPLIGHT_STATES.STEADY]: null,
    [constants.STOPLIGHT_STATES.MISS]: null,
};

const initTrafficLight = ({ ledReadyPin, ledSteadyPin, ledMissPin }) => {
    // Initialize hardware
    leds[constants.STOPLIGHT_STATES.READY] = new five.Led(ledReadyPin);
    leds[constants.STOPLIGHT_STATES.STEADY] = new five.Led(ledSteadyPin);
    leds[constants.STOPLIGHT_STATES.MISS] = new five.Led(ledMissPin);

    // Initialize LED state in global store
    Object.keys(constants.STOPLIGHT_STATES).forEach(state => {
        setState({ key: 'isTrafficLightLedOn_' + state, val: false });
    });

    // Set up LED state change handlers
    Object.keys(constants.STOPLIGHT_STATES).forEach(state => {
        onEvent('updated:isTrafficLightLedOn_' + state, result => {
            Object.keys(constants.STOPLIGHT_STATES).forEach(state => {
                Object.keys(leds).forEach(led => {
                    led.off();
                });
            });

            if (state === constants.STOPLIGHT_STATES.GO) {
                Object.keys(leds).forEach(led => {
                    led.on();
                });
            } else {
                leds[constants.STOPLIGHT_STATES[state]][
                    result ? 'on' : 'off'
                ]();
            }
        });
    });
};

// Enable one of the traffic light states. The special state 'go' means to set state of all at once.
// Keep track of previous set state so we don't update unnecessarily
let previousSetState = null;
const setTrafficLightState = stateId => {
    if (stateId !== previousSetState) {
        setState({ key: 'isTrafficLightLedReadyOn', val: true });
        setState({ key: 'isTrafficLightLedSteadyOn', val: true });
        setState({ key: 'isTrafficLightLedMissOn', val: true });

        if (stateId === constants.STOPLIGHT_STATES.GO) {
            setState({ key: 'isTrafficLightLedReadyOn', val: true });
            setState({ key: 'isTrafficLightLedSteadyOn', val: true });
            setState({ key: 'isTrafficLightLedMissOn', val: true });
        } else if (stateId === constants.STOPLIGHT_STATES.READY) {
            setState({ key: 'isTrafficLightLedReadyOn', val: true });
        } else if (stateId === constants.STOPLIGHT_STATES.STEADY) {
            setState({ key: 'isTrafficLightLedSteadyOn', val: true });
        } else if (stateId === constants.STOPLIGHT_STATES.MISS) {
            setState({ key: 'isTrafficLightLedMissOn', val: true });
        }

        previousSetState = stateId;
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
