const store = {};

// Server-side setState
const setState = ({ key, val }) => {
    console.log('>>>', 'setState', key, val); // DEBUGGGG

    store[key] = typeof val === 'function' ? val(store) : val;

    io.emit(`updated:${key}`, store[key], store);
};

// Web UI setState
const initSharedStore = () => {
    console.log('>>>', 'initSharedStore'); // DEBUGGGG
    io.on('connection', socket => {
        socket.on('setState', setState);
    });
};

module.exports = {
    initSharedStore,
    setState,
};
