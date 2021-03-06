// Buzzer hardware and utilities. Consists of one piezo speaker.

const mockRequire = require('./mock-hardware');
const { wait } = require('../AsyncUtils');
const { onEvent } = require('../EventUtils');
const { setState } = require('../GlobalState');
const noteToFreq = require('../audio/Notes');
const songs = require('../audio/songs');

const PLAY_DUTY_CYCLE = 0.2;
const STOP_DUTY_CYCLE = 0;

let tesselLowLevel;

const initBuzzerHardware = ({
    isDeviceEnabled,
    pinsAndPorts: { piezoPort, piezoPin },
}) => {
    tesselLowLevel = mockRequire('tessel', isDeviceEnabled, {
        piezoPort,
        piezoPin,
    });

    // Play a frequency on the specified PWM pin until stopped. Returns a
    // promise.
    const playFrequency = ({ freq, pwmPort, pwmPin, duration }) =>
        new Promise(resolve => {
            const targetPin = tesselLowLevel.port[pwmPort].pin[pwmPin];

            if (freq) {
                tesselLowLevel.pwmFrequency(freq);
                targetPin.pwmDutyCycle(PLAY_DUTY_CYCLE);
            } else {
                tesselLowLevel.pwmFrequency(1);
                targetPin.pwmDutyCycle(STOP_DUTY_CYCLE);
            }

            return wait(duration).then(resolve);
        });

    // Play a j5-format song
    // https://github.com/julianduque/j5-songs
    const playSong = async ({ cb, piezoPort, piezoPin, song }) => {
        const notes = song.song;
        notes.push([null, 0]);
        for (let i = 0; i < notes.length; ++i) {
            const freq = notes[i][0] && noteToFreq[notes[i][0].toLowerCase()];
            const duration = notes[i][1] * 1000 * (60 / song.tempo);
            await playFrequency({
                freq,
                pwmPort: piezoPort,
                pwmPin: piezoPin,
                duration,
            });
        }
        cb();
    };

    onEvent('action:playAlarm', songName => {
        setState('isBuzzerPlaying', true);

        playSong({
            cb: () => {
                setState('isBuzzerPlaying', false);
            },
            piezoPin,
            piezoPort,
            song: songs[songName],
        });
    });
};

module.exports = {
    initBuzzerHardware,
};
