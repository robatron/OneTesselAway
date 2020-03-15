// Wait to resolve for the specified timeout
const wait = timeoutMs =>
    new Promise(resolve => setTimeout(resolve, timeoutMs));

module.exports = {
    wait,
};
