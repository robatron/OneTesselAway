const socket = io.connect();

// Document element references -------------------------------------------------

const btnAlarmSetEl = document.querySelector('.btn-alarm-set');
const btnAlarmPlayEl = document.querySelector('.btn-alarm-play');
const imgBuzzerEl = document.querySelector('.img-buzzer');
const lcdScreenEls = document.querySelectorAll('.lcd-screen');
const ledAlarmEl = document.querySelector('.led-alarm');
const textGlobalStateEl = document.querySelector('#global-state');

// Utilities -------------------------------------------------------------------

const setLed = (ledEl, on) => {
    const ledColor = getComputedStyle(ledEl).borderColor;
    ledEl.style.backgroundColor = on ? ledColor : 'white';
};

// Web UI <-> server event communication ---------------------------------------

// Emit an event to the server
const emitEvent = (eventName, ...rest) => {
    console.log('emitEvent', eventName, ...rest);
    socket.emit(eventName, ...rest);
};

// When the server state updates an item in the global store, call
// the callback, and sync the front-end state with the back-end
const onGlobalStateUpdate = (stateKey, cb) => {
    socket.on('updated:' + stateKey, updatedVal => {
        console.log('onStateUpdatedEvent', 'updated:' + stateKey, updatedVal);
        globalState[stateKey] = updatedVal;
        cb(updatedVal);
    });
};

// Set an item in the global server state
const setServerState = (key, val) => emitEvent('setState', key, val);

// LCD Screen ------------------------------------------------------------------

const initLcdScreenSimHardware = () => {
    // Update the LCD screen when `lcdScreenLines` update on the server
    onGlobalStateUpdate('lcdScreenLines', screenLines => {
        lcdScreenEls.forEach(
            (lcdScreenEl, i) =>
                (lcdScreenEl.innerHTML =
                    screenLines[i] || lcdScreenEl.innerHTML),
        );
    });
};

// Stoplight -------------------------------------------------------------------

const initStoplightSimHardware = () => {
    // Update the stoplight LEDs if stoplight state is valid
    const updateStoplight = stoplightState => {
        if (stoplightState) {
            constants.STOPLIGHT_LED_NAMES.forEach(ledName => {
                const ledStoplightEl = document.querySelector(
                    '.led-stoplight-' + ledName,
                );
                setLed(
                    ledStoplightEl,
                    [constants.STOPLIGHT_STATES.GO, ledName].includes(
                        stoplightState,
                    ),
                );
            });
        }
    };

    // When the stoplight state is updated, turn on the corresponding
    // LED(s). Turn on all of them if stoplight state is 'go';
    onGlobalStateUpdate('stoplightState', updateStoplight);

    // Set stoplight on startup
    updateStoplight(globalState.stoplightState);
};

// Alarm -----------------------------------------------------------------------

const initAlarmSimHardware = () => {
    // Speaker
    onGlobalStateUpdate('isBuzzerPlaying', isBuzzerPlaying => {
        imgBuzzerEl.src = `/static/img/buzzer-${
            isBuzzerPlaying ? 'on.gif' : 'off.png'
        }`;
    });

    // LED
    onGlobalStateUpdate('isAlarmEnabled', isAlarmEnabled => {
        setLed(ledAlarmEl, isAlarmEnabled);
    });

    // Button
    btnAlarmSetEl.onclick = e => {
        e.preventDefault();
        setServerState('isAlarmEnabled', !globalState.isAlarmEnabled);
    };

    // Set alarm LED on startup
    setLed(ledAlarmEl, globalState.isAlarmEnabled);
};
// Debug -----------------------------------------------------------------------

const initDebugCtrls = () => {
    onGlobalStateUpdate('globalState', globalState => {
        textGlobalStateEl.innerHTML = JSON.stringify(globalState, null, 2);
    });
};

// EXTENDED DEVICE CONTROLS ----------------------------------------------------

const initAlarmExCtrls = () => {
    // Play alarm
    btnAlarmPlayEl.onclick = e => {
        e.preventDefault();
        emitEvent('action:playAlarm', 'nyanIntro');
    };
};

const initObaEgExCtrls = () => {
    // Force OBA Example Responses
    Object.keys(constants.STOPLIGHT_STATES).forEach(stoplightStateKey => {
        const stoplightState = constants.STOPLIGHT_STATES[stoplightStateKey];
        const btnObaEgEl = document.querySelector(
            '.btn-oba-eg-' + stoplightState,
        );

        // When one of the OBA example response buttons is clicked,
        // set the obaApiEgState the corresponding stoplight state
        // if it's not already, otherwise toggle it off.
        btnObaEgEl.onclick = e => {
            e.preventDefault();
            setServerState(
                'obaApiEgState',
                globalState.obaApiEgState !== stoplightState
                    ? stoplightState
                    : null,
            );

            // Update arrival info immediately
            emitEvent('action:updateArrivalInfo');
        };

        // Highlight a button if its corresponding state is set
        const handleObaApiEgStateUpdate = obaApiEgState => {
            const isSelected = obaApiEgState === stoplightState;
            btnObaEgEl.style.color = isSelected ? 'darkred' : 'inherit';
            btnObaEgEl.style.fontWeight = isSelected ? 'bold' : 'inherit';
        };
        onGlobalStateUpdate('obaApiEgState', handleObaApiEgStateUpdate);
        handleObaApiEgStateUpdate(globalState.obaApiEgState);
    });
};

// Main ------------------------------------------------------------------------

console.log('Initializing Web UI...');

initAlarmExCtrls();
initAlarmSimHardware();
initDebugCtrls();
initLcdScreenSimHardware();
initObaEgExCtrls();
initStoplightSimHardware();
