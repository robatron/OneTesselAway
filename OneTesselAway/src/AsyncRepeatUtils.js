const wait = timeoutMs =>
    new Promise(resolve => setTimeout(resolve, timeoutMs));

// Fire and repeat an async function synchronously at the specified
// timeout
const fireAndRepeat = (timeoutMs, func) =>
    new Promise(resolve => {
        setInterval(func, timeoutMs);
        return wait(timeoutMs).then(resolve);
    });

module.exports = {
    fireAndRepeat,
};
