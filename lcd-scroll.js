const five = require('johnny-five');
const Tessel = require('tessel-io');
const board = new five.Board({
    io: new Tessel(),
});

const LINE_LENGTH = 16;
const MESSAGE =
    "What the fuck did you just fucking say about me, you little bitch? I'll have you know I graduated top of my class in the Navy Seals, and I've been involved in numerous secret raids on Al-Quaeda, and I have over 300 confirmed kills. I am trained in gorilla warfare and I'm the top sniper in the entire US armed forces. You are nothing to me but just another target. I will wipe you the fuck out with precision the likes of which has never been seen before on this Earth, mark my fucking words. You think you can get away with saying that shit to me over the Internet? Think again, fucker. As we speak I am contacting my secret network of spies across the USA and your IP is being traced right now so you better prepare for the storm, maggot. The storm that wipes out the pathetic little thing you call your life. You're fucking dead, kid. I can be anywhere, anytime, and I can kill you in over seven hundred ways, and that's just with my bare hands. Not only am I extensively trained in unarmed combat, but I have access to the entire arsenal of the United States Marine Corps and I will use it to its full extent to wipe your miserable ass off the face of the continent, you little shit. If only you could have known what unholy retribution your little \"clever\" comment was about to bring down upon you, maybe you would have held your fucking tongue. But you couldn't, you didn't, and now you're paying the price, you goddamn idiot. I will shit fury all over you and you will drown in it. You're fucking dead, kiddo.";

board.on('ready', () => {
    const lcd = new five.LCD({
        pins: ['a2', 'a3', 'a4', 'a5', 'a6', 'a7'],
    });

    const message = MESSAGE.concat(' '.repeat(LINE_LENGTH * 2));
    let curLine = 0;
    board.loop(2000, () => {
        const lines = [
            message.slice(curLine, curLine + LINE_LENGTH),
            message.slice(curLine + LINE_LENGTH, curLine + LINE_LENGTH * 2),
        ];

        lines.forEach((line, i) => {
            lcd.cursor(i, 0).print(line);
        });

        curLine += LINE_LENGTH * 2;

        if (curLine + LINE_LENGTH * 2 > message.length) {
            curLine = 0;
        }

        console.log('>>> line 0: ', lines[0]);
        console.log('>>> line 1: ', lines[1]);
        console.log('>>> curLine:', curLine);
        console.log('------------');
    });

    // let curPos = 0;
    // board.loop(1, () => {
    //     lcd.cursor(0, 0).print(message.slice(curPos, curPos + LINE_LENGTH));
    //     lcd.cursor(1, 0).print(
    //         message.slice(curPos + LINE_LENGTH, curPos + LINE_LENGTH * 2),
    //     );

    //     curPos += 5;

    //     if (curPos + LINE_LENGTH * 2 > message.length) {
    //         curPos = 0;
    //     }
    // });
});
