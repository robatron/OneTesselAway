const noteToFreq = require('../audio/Notes');
const { wait } = require('../AsyncRepeatUtils');
const { onEvent } = require('../EventUtils');
const songs = require('../audio/songs');

const PLAY_DUTY_CYCLE = 0.2;
const STOP_DUTY_CYCLE = 0;

let tesselLowLevel;

const initBuzzerHardware = ({ isDeviceEnabled, piezoPort, piezoPin }) => {
    if (isDeviceEnabled) {
        log.info('Initializing buzzer hardware...');
        tesselLowLevel = require('tessel');
    } else {
        log.info('Initializing mock buzzer hardware...');
        tesselLowLevel = {
            port: {
                [piezoPort]: {
                    pin: {
                        [piezoPin]: {
                            pwmDutyCycle: DS => {
                                log.info(`Mock pwmDutyCycle "${DS}"`);
                            },
                        },
                    },
                },
            },
            pwmFrequency: freq => {
                log.info(`Mock pwmFrequency "${freq}"`);
            },
        };
    }

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
    const playSong = async ({ piezoPort, piezoPin, song }) => {
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
    };

    onEvent('action:playAlarm', songName => {
        playSong({ piezoPin, piezoPort, song: songs[songName] });
    });
};

module.exports = {
    initBuzzerHardware,
};
