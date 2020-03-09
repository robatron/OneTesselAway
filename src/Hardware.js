const five = require('johnny-five');
const Tessel = require('tessel-io');
var tesselLowLevel = require('tessel');
const songs = require('j5-songs');

let lcdScreen;
let button;

const initHardware = ({ buttonPin, lcdPins, piezoPin }) => {
    var board = new five.Board({ io: new Tessel() });

    return new Promise(resolve => {
        board.on('ready', () => {
            log.info(
                `Device board ready. Configuring LCD display with pins ${lcdPins}...`,
            );

            lcdScreen = new five.LCD({ pins: lcdPins });
            button = new five.Button(buttonPin);

            let songPlaying;
            let songInterval;
            const startSong = () => {
                console.log('Playing Mario...'); // DEBUGGGG

                const mario = [659, 659, 659, 523, 659, 784, 392];
                let currentNote = 0;

                songPlaying = true;
                songInterval = setInterval(() => {
                    tesselLowLevel.pwmFrequency(
                        mario[currentNote % mario.length],
                    );
                    tesselLowLevel.port.B.pin[6].pwmDutyCycle(0.2);
                    ++currentNote;
                }, 250);
            };

            const stopSong = () => {
                console.log('Stopping Mario...');
                songPlaying = false;
                tesselLowLevel.port.B.pin[6].pwmDutyCycle(0);
                clearInterval(songInterval);
            };

            startSong();
            button.on('release', () => {
                console.log('Button Released!');
                if (songPlaying) {
                    stopSong();
                } else {
                    startSong();
                }
            });

            resolve();
        });
    });
};

const updateLcdScreen = (displayLines, options) => {
    if (!lcdScreen) {
        log.error(new Error('LCD display has not been initialized'));
        return;
    }

    displayLines.forEach((line, i) => {
        lcdScreen.cursor(i, 0).print(line.padEnd(16, ' '));
    });
};

module.exports = {
    initHardware,
    updateLcdScreen,
};
