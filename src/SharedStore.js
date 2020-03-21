const { emitEvent, onEvent } = require('./EventUtils');

const store = {};

// Set the state of an item in the store, and emit an event. `val` may be a
// function that will be passed the previous state of the store.
const setState = ({ key, val, meta }) => {
    log.info(['setState', key, val, JSON.stringify(meta) || ''].join(' '));
    store[key] = typeof val === 'function' ? val(store) : val;
    emitEvent(`updated:${key}`, store[key], store);
};

// Allow state to be set via the Web UI
const initSharedStore = () => {
    onEvent('setState', ({ key, val }) =>
        setState({ key, val, meta: { fromWebUi: true } }),
    );
};

module.exports = {
    getState: () => store,
    initSharedStore,
    setState,
};
