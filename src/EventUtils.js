// Handle events to/from the Web UI, and within the device
const EventEmitter = require('events');
const socket = require('socket.io');

const stateUpdatePrefix = 'updated:';
let io;

// Set up event emitter for back-end app
class eventEmitter extends EventEmitter {}
const ee = new eventEmitter();

// Emit an event with some optional data to the rest of the app and the
// Web UI
const emitEvent = (eventName, ...rest) => {
    log.info(['emitEvent', eventName].join(' '));
    ee.emit(eventName, ...rest);
    io.emit(eventName, ...rest);
};

// Helper to emit an event when a state item is updated
const emitGlobalStateUpdateEvent = (stateKey, ...rest) => {
    emitEvent(stateUpdatePrefix + stateKey, ...rest);
};

// Set a callback to run when an event is emitted from the rest of the
// app or from the Web UI
const onEvent = (eventName, cb) => {
    ee.on(eventName, cb);
    io.on('connection', socket => {
        socket.on(eventName, cb);
    });
};

// Helper to run a callback when an item in the state is updated
const onGlobalStateUpdate = (stateKey, cb) => {
    onEvent(stateUpdatePrefix + stateKey, cb);
};

const initEvents = server => {
    io = socket(server);
};

module.exports = {
    emitEvent,
    emitGlobalStateUpdateEvent,
    initEvents,
    onEvent,
    onGlobalStateUpdate,
};
