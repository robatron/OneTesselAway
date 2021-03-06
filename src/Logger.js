// Sets up global logger

const fs = require('fs');
const { format } = require('logform');
const { createLogger, transports } = require('winston');

// Global shared log
global.log;

const initLogger = logfileName => {
    log = createLogger({
        level: 'info',
        format: format.combine(
            format.splat(),
            format.timestamp(),
            format.errors({ stack: true }),
            format.printf(
                info =>
                    `${info.timestamp} [${info.level}] ${info.message} ${
                        info.stack ? '\n' + info.stack : ''
                    }`,
            ),
        ),
        transports: [
            new transports.File({
                filename: logfileName,
                maxFiles: 10,
                maxsize: 1024 * 100, // 100 KiB
                tailable: true,
            }),
            new transports.Console(),
        ],
    });

    return log;
};

const getLatestLogFromFile = (logfile, { reverseLines }) => {
    let loglines;

    try {
        loglines = fs
            .readFileSync(logfile)
            .toString()
            .split('\n');

        if (reverseLines) {
            loglines.reverse();
        }

        // Slice to omit first line which is always a newline
        loglines = loglines.slice(1).join('\n');
    } catch (e) {
        log.error(`Failed to load logfile ${logfile}: ${e.toString()}`);
    }

    return loglines;
};

module.exports = {
    getLatestLogFromFile,
    initLogger,
};
