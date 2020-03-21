const { emitEvent, onEvent } = require('./EventUtils');

const store = {};

// Set a state of an item in the store
const setState = ({ key, val, meta }) => {
    console.log('>>>', 'setState', key, val, meta || ''); // DEBUGGGG

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
