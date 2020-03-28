const { emitGlobalStateUpdateEvent, onEvent } = require('./EventUtils');

// Global state which is a flat object
const globalState = {};

// Set a value in the global state, and emit an event. `val` may be a
// function that will be supplied the current global state
const setState = (key, val, meta) => {
    log.info(['setState', key, val, JSON.stringify(meta) || ''].join(' '));
    globalState[key] = typeof val === 'function' ? val(globalState) : val;
    emitGlobalStateUpdateEvent('globalState', globalState);
    emitGlobalStateUpdateEvent(key, globalState[key]);
};

// Allow state to be set via the Web UI
const initGlobalState = () => {
    onEvent('setState', (key, val) => setState(key, val, { fromWebUi: true }));
};

module.exports = {
    getState: key => (key ? globalState[key] : globalState),
    initGlobalState,
    setState,
};
