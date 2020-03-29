// Mock hardware for the `johnny-five` API. Note me must use `function` instead
// of fat-arrow functions for them to be valid constructors.

module.exports = ({ moduleName }) => ({
    Button: function({ id, pin }) {
        return {
            on: cb => {
                log.info(
                    `[${moduleName}] [${id}] [Pin ${pin}] Mock Button.on w/ args %o`,
                    cb,
                );
            },
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
