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

    // When the stoplight state is updated, turn on the corresponding LED(s)
    onEvent('updated:stoplightState', stoplightState => {
        Object.keys(leds).forEach(ledName => {
            leds[ledName][
                stoplightState ===
                [constants.STOPLIGHT_STATES.GO, ledName].includes(
                    stoplightState,
                )
                    ? 'on'
                    : 'off'
            ]();
        });
    });

    // Allow the stoplight state to be set manually
    onEvent('action:setStoplightState', stoplightState => {
        setState({
            key: 'stoplightState',
            val: stoplightState,
        });
    });
};

module.exports = {
    initStoplight,
};
