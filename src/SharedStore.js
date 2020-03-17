const store = {};

// Server-side setState
const setState = (key, newStateFn) => {
    store[key] = newStateFn(store);
    io.emit(`updated:${key}`, store[key], store);
};

// Web UI setState
io.on('setState', setState);

module.exports = {
    setState,
};
