const { wait } = require('../AsyncRepeatUtils');
const constants = require('../Constants');
const { emitEvent, onEvent } = require('../EventUtils');
const { setState } = require('../SharedStore');

// Object containing references to LED hardware
const leds = constants.STOPLIGHT_LED_NAMES.reduce((ledName, accum) => {
    accum[ledName] = null;
    return accum;
}, {});

const initTrafficLight = ({
    isDeviceEnabled,
    ledReadyPin,
    ledSteadyPin,
    ledMissPin,
}) => {
    if (isDeviceEnabled) {
        log.info('Initializing stoplight hardware...');

        const five = require('johnny-five');

        leds[constants.STOPLIGHT_STATES.READY] = new five.Led(ledReadyPin);
        leds[constants.STOPLIGHT_STATES.STEADY] = new five.Led(ledSteadyPin);
        leds[constants.STOPLIGHT_STATES.MISS] = new five.Led(ledMissPin);
    } else {
        log.info('Initializing mock alarm hardware...');

        constants.STOPLIGHT_LED_NAMES.forEach(stoplightState => {
            leds[stoplightState] = {
                off: () => {
                    log.info(`Mock "${stoplightState}" off`);
                },
                on: () => {
                    log.info(`Mock "${stoplightState}" on`);
                },
            };
        });
    }

    // Initialize LED state in global store
    Object.keys(constants.STOPLIGHT_STATES).forEach(state => {
        setState({ key: 'isTrafficLightStateOn_' + state, val: false });
    });

    // Set up stoplight state change handlers
    Object.keys(constants.STOPLIGHT_STATES).forEach(state => {
        onEvent('updated:isTrafficLightStateOn_' + state, result => {
            // Always start by disabling all LEDs
            Object.keys(constants.STOPLIGHT_LED_NAMES).forEach(led => {
                leds[led].off();
            });

            // The 'GO' state is special: Turn on all LEDs
            if (state === constants.STOPLIGHT_STATES.GO) {
                Object.keys(constants.STOPLIGHT_LED_NAMES).forEach(led => {
                    leds[led].on();
                });
            } else {
                leds[state][result ? 'on' : 'off']();
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

module.exports = {
    getLeds: () => leds,
    initTrafficLight,
    setTrafficLightState,
};
