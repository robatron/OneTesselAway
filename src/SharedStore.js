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

module.exports = {
    onStateChange,
    setState,
};
