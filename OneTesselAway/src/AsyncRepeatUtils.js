// Wait to resolve for the specified timeout
const wait = timeoutMs =>
    new Promise(resolve => setTimeout(resolve, timeoutMs));

// Fire and repeat an async function synchronously at the specified
// timeout. Return the interval ID in a callback so we can kill it later
const fireAndRepeat = (timeoutMs, func, intervalIdCallback) =>
    new Promise(resolve => {
        const intervalId = setInterval(func, timeoutMs);
        intervalIdCallback(intervalId);
        return wait(timeoutMs).then(resolve);
    });

module.exports = {
    fireAndRepeat,
};
