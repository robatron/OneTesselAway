const store = {};
const subscriptions = {};

const onStateChange = callback => subscriptions.isAlarmSet.push(callback);

const setState = (key, newState) => {
    store[key] = newState;
    subscriptions[key] = subscriptions[key] || [];
    [...new Array(subscriptions[key].length)].forEach(i => {
        subscriptions[key].pop()();
    });
};

const getState = key => store[key];

io.on('btnAlarmClicked', () => {
    setState('isAlarmEnabled', !getState('isAlarmEnabled'));
});

module.exports = {
    onStateChange,
    setState,
    getState,
};
