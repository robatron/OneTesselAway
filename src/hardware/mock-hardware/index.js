// Utility for importing either a real or mocked hardware module
module.exports = (moduleName, isDeviceEnabled, mockRequireArgs) => {
    if (isDeviceEnabled) {
        log.info(`Importing hardware module "${moduleName}"`);
        return require(moduleName);
    }

    const moduleRequirePath = `${__dirname}/./${moduleName}`;
    log.info(
        `Importing MOCK hardware module "${moduleRequirePath}" with args %o`,
        mockRequireArgs,
    );
    return require(moduleRequirePath)(mockRequireArgs);
};
