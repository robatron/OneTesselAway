const { emitEvent, onEvent } = require('./EventUtils');

const store = {};

// Server-side setState
const setState = ({ key, val }) => {
    console.log('>>>', 'setState', key, val); // DEBUGGGG

    store[key] = typeof val === 'function' ? val(store) : val;

    emitEvent(`updated:${key}`, store[key], store);
};

// Web UI setState
const initSharedStore = () => {
    console.log('>>>', 'initSharedStore'); // DEBUGGGG

    onEvent('setState', setState);
};

module.exports = {
    getState: () => store,
    initSharedStore,
    setState,
};
