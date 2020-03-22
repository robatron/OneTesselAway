// Handle events to/from the Web UI, and within the device
const EventEmitter = require('events');
const socket = require('socket.io');

class eventEmitter extends EventEmitter {}
const ee = new eventEmitter();

let io;

const emitEvent = (eventName, ...rest) => {
    log.info(['emitEvent', eventName].join(' '));
    ee.emit(eventName, ...rest);
    io.emit(eventName, ...rest);
};

const onEvent = (eventName, ...rest) => {
    ee.on(eventName, ...rest);
    io.on('connection', socket => {
        socket.on(eventName, ...rest);
    });
};

const initEvents = server => {
    io = socket(server);
};

module.exports = {
    emitEvent,
    initEvents,
    onEvent,
};
