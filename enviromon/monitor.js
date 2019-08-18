var http = require('http');
var os = require('os');
var path = require('path');

var five = require('johnny-five');
var Tessel = require('tessel-io');
var board = new five.Board({
    io: new Tessel(),
});

var Express = require('express');
var SocketIO = require('socket.io');

var application = new Express();
var server = new http.Server(application);
var io = new SocketIO(server);

application.use(Express.static(path.join(__dirname, '/app')));
application.use('/vendor', Express.static(__dirname + '/node_modules/'));

const UPDATE_DELAY = 1000;

board.on('ready', () => {
    var clients = new Set();
    var monitor = new five.Multi({
        controller: 'BME280',
        elevation: 128,
    });
    var updated = Date.now() - UPDATE_DELAY;

    monitor.on('change', () => {
        var now = Date.now();
        if (now - updated >= UPDATE_DELAY) {
            updated = now;

            clients.forEach(recipient => {
                recipient.emit('report', {
                    thermometer: monitor.thermometer.fahrenheit,
                    barometer: monitor.barometer.pressure,
                    hygrometer: monitor.hygrometer.relativeHumidity,
                    altimeter: monitor.altimeter.feet,
                });
            });
        }
    });

    io.on('connection', socket => {
        // Allow up to 5 monitor sockets to
        // connect to this enviro-monitor server
        if (clients.size < 5) {
            clients.add(socket);
            // When the socket disconnects, remove
            // it from the recipient set.
            socket.on('disconnect', () => clients.delete(socket));
        }
    });

    var port = 3000;
    server.listen(port, () => {
        console.log(
            `http://${os.networkInterfaces().wlan0[0].address}:${port}`,
        );
    });

    process.on('SIGINT', () => {
        server.close();
    });
});
