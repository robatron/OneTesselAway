const five = require('johnny-five');
const Tessel = require('tessel-io');
const { playSong, NOTES } = require('./SoundUtils');
const songs = require('./songs');

const songList = Object.keys(songs);
let songSelection = 0;

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

            button.on('release', () => {
                const songTitle = songList[songSelection % songList.length];
                console.log(`Button Released! Playing song "${songTitle}"`);
                playSong({
                    piezoPin,
                    piezoPort,
                    song: songs[songTitle],
                });
                ++songSelection;
            });

            playSong({
                piezoPin,
                piezoPort,
                song: songs[songList[songSelection]],
            });
            ++songSelection;

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
