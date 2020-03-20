// Handle events to/from the Web UI, and within the device
const EventEmitter = require('events');
const socket = require('socket.io');

class eventEmitter extends EventEmitter {}
const ee = new eventEmitter();

let io;

const emitEvent = (eventName, ...rest) => {
    ee.emit(eventName, ...rest);
    io.emit(eventName, ...rest);
};

const onEvent = (eventName, cb) => {
    ee.on(eventName, cb);
    io.on('connection', socket => {
        socket.on(eventName, cb);
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
