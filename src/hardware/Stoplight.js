const { wait } = require('../AsyncRepeatUtils');
const constants = require('../Constants');
const { emitEvent, onEvent } = require('../EventUtils');
const { setState } = require('../SharedStore');

// Object containing references to LED hardware
const leds = constants.STOPLIGHT_LED_NAMES.reduce((accum, ledName) => {
    accum[ledName] = null;
    return accum;
}, {});

const initStoplight = ({
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
    Object.keys(constants.STOPLIGHT_STATES).forEach(stateKey => {
        const state = constants.STOPLIGHT_STATES[stateKey];
        setState({
            key: 'isStoplightStateOn_' + state,
            val: false,
        });
    });

    // Set up stoplight state change handlers
    Object.keys(constants.STOPLIGHT_STATES).forEach(stateKey => {
        const state = constants.STOPLIGHT_STATES[stateKey];

        onEvent('updated:isStoplightStateOn_' + state, result => {
            // Always start by disabling all LEDs
            Object.keys(leds).forEach(led => {
                leds[led].off();
            });

            // The 'GO' state is special: Turn on all LEDs
            if (state === constants.STOPLIGHT_STATES.GO) {
                Object.keys(leds).forEach(led => {
                    leds[led].on();
                });
            } else {
                leds[state][result ? 'on' : 'off']();
            }
        });
    });

    // Set up stoplight state change action. Enable one of the stoplight
    // states. The special state 'go' means to set state of all at once.
    onEvent('action:setStoplightState', slState => {
        setState({
            key: 'isStoplightStateOn_' + slState,
            val: true,
        });
    });
};

module.exports = {
    initStoplight,
};