// Mock hardware for the `tessel` low-level hardware API
module.exports = ({ piezoPort, piezoPin }) => ({
    port: {
        [piezoPort]: {
            pin: {
                [piezoPin]: {
                    pwmDutyCycle: DS => {
                        log.info(`Mock pwmDutyCycle "${DS}"`);
                    },
                },
            },
        },
    },
    pwmFrequency: freq => {
        log.info(`Mock pwmFrequency "${freq}"`);
    },
});
