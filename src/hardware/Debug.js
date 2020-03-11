// Hardware for manual test and debug

const five = require('johnny-five');

let isDebugForceGoState = false;

// Initialize debug hardware
const initDebugHardware = ({ buttonDebugForceGoStatePin }) => {
    const buttonDebugForceGoState = new five.Button(buttonDebugForceGoStatePin);

    buttonDebugForceGoState.on('release', () => {
        isDebugForceGoState = !isDebugForceGoState;
        log.info(`Toggled 'go' state to: ${isDebugForceGoState}`);
    });
};

module.exports = {
    getIsDebugForceGoState: () => isDebugForceGoState,
    initDebugHardware,
};
