// Mock hardware for the `johnny-five` API. Note me must use `function` instead
// of fat-arrow functions for them to be valid constructors.

module.exports = ({ moduleName }) => ({
    Board: function({ id, io }) {
        return {
            on: (eventName, cb) => {
                log.info(
                    `[${moduleName}] [${id}] [io %o] Set and immediately exec cb for mock Board.on('${eventName}') handler`,
                    io,
                );
                cb();
            },
        };
    },
    Button: function({ id, pin }) {
        return {
            on: (eventName, cb) => {
                log.info(
                    `[${moduleName}] [${id}] [Pin ${pin}] Set mock Button.on('${eventName}') handler`,
                );
            },
        };
    },
    LCD: function({ id, pins }) {
        return {
            cursor: i => ({
                print: line => {
                    log.info(
                        `[${moduleName}] [${id}] [Pins ${pins}] Mock LCD screen print line "${i}": "${line}"`,
                    );
                },
            }),
        };
    },
    Led: function({ id, pin }) {
        return {
            off: () => {
                log.info(`[${moduleName}] [${id}] [Pin ${pin}] Mock Led.off`);
            },
            on: () => {
                log.info(`[${moduleName}] [${id}] [Pin ${pin}] Mock Led.on`);
            },
        };
    },
});
