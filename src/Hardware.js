const five = require('johnny-five');
const Tessel = require('tessel-io');
var tesselLowLevel = require('tessel');
const { playFrequency, NOTES } = require('./SoundUtils');

let lcdScreen;
let button;

const initHardware = ({ buttonPin, lcdPins, piezoPin, piezoPort }) => {
    var board = new five.Board({ io: new Tessel() });

    return new Promise(resolve => {
        board.on('ready', () => {
            log.info(
                `Device board ready. Configuring LCD display with pins ${lcdPins}...`,
            );

            lcdScreen = new five.LCD({ pins: lcdPins });
            button = new five.Button(buttonPin);

            const startSong = async () => {
                console.log('Playing Mario...'); // DEBUGGGG

                const BPM = 200;
                const marioSong = [
                    [NOTES['e5'], 1 / 4],
                    [null, 1 / 4],
                    [NOTES['e5'], 1 / 4],
                    [null, 3 / 4],
                    [NOTES['e5'], 1 / 4],
                    [null, 3 / 4],
                    [NOTES['c5'], 1 / 4],
                    [null, 1 / 4],
                    [NOTES['e5'], 1 / 4],
                    [null, 3 / 4],
                    [NOTES['g5'], 1 / 4],
                    [null, 7 / 4],
                    [NOTES['g4'], 1 / 4],
                    [null, 7 / 4],
                ];

                for (let i = 0; i < marioSong.length; ++i) {
                    const freq = marioSong[i][0];
                    const duration = marioSong[i][1] * 1000 * (60 / BPM);
                    await playFrequency({
                        freq,
                        pwmPort: piezoPort,
                        pwmPin: piezoPin,
                        duration,
                    });
                }
            };

            button.on('release', async () => {
                console.log('Button Released!');
                await startSong();
            });

            startSong().then(resolve);
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
