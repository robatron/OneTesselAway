window.onload = function() {
    var socket = io();
    var monitor = {};

    monitor.thermometer = new JustGage({
        id: 'thermometer',
        value: 10,
        min: 0,
        max: 100,
        title: 'Thermometer',
        label: '° Fahrenheit',
        relativeGaugeSize: true,
    });

    monitor.barometer = new JustGage({
        id: 'barometer',
        value: 100,
        min: 50,
        max: 150,
        title: 'Barometer',
        label: 'Pressure/kPa',
        relativeGaugeSize: true,
    });

    monitor.altimeter = new JustGage({
        id: 'altimeter',
        value: 10,
        min: 0,
        max: 100,
        title: 'Altimeter',
        label: 'Feet',
        relativeGaugeSize: true,
    });

    monitor.hygrometer = new JustGage({
        id: 'hygrometer',
        value: 10,
        min: 0,
        max: 100,
        title: 'Hygrometer',
        label: 'Humidity %',
        relativeGaugeSize: true,
    });

    var displays = Object.keys(monitor);

    socket.on('report', function(data) {
        displays.forEach(function(display) {
            monitor[display].refresh(data[display]);
        });
    });
};
