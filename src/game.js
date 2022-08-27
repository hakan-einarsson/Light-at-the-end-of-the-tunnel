import {
    init,
    Sprite,
    GameLoop,
    setImagePath,
    loadImage,
    SpriteSheet,
    initKeys,
    initGamepad,
} from 'kontra';
import { levels } from './levels.js';
import { background } from './background.js';
import { inputHandler } from './inputHandler.js';

let { canvas } = init();
setImagePath('./../assets/images');
initKeys();
initGamepad();
let currentLevel = 0;

const backgroundCanvas = document.getElementById('background');
background(backgroundCanvas, levels[currentLevel].map);
canvas.width = levels[currentLevel].size;
canvas.height = levels[currentLevel].size;
canvas.style.backgroundColor = 'rgba(0, 0, 0, 0)'


let overlay = Sprite({
    x: 0,
    y: 0,
    color: 'black',
    opacity: 0.4,
    width: canvas.width,
    height: canvas.height,
    dx: 0,
    opacityChange: 0.02,
});

loadImage('wisp.png').then((image) => {
    let wispSheet = SpriteSheet({
        image: image,
        frameWidth: 16,
        frameHeight: 16,
        animations: {
            idle: {
                frames: '0..3',
                frameRate: 5
            }
        }
    });

    let player = Sprite({
        x: 40,
        y: 5,
        rad: 4,
        animations: wispSheet.animations,
        speed: 1,
        getPosition: function () {
            return { x: this.x + 8, y: this.y + 8 };
        }
    });
    player.playAnimation('idle');

    //set current time in seconds
    let lastSecond = new Date().getTime() / 1000;
    let secondsElapsed = 0;
    let levelTime = 35;
    let stageClear = false;
    let loop = GameLoop({
        update: function () {
            let newSeconds = new Date().getTime() / 1000;
            if (Math.floor(newSeconds - lastSecond) != 0) {
                lastSecond = newSeconds;
                secondsElapsed++;
                if (secondsElapsed <= 30) {
                    overlay.opacity += overlay.opacityChange;
                }
                if (secondsElapsed == levelTime) {
                    stageClear = true;
                }
            }
            inputHandler(player, levels[currentLevel].map);

            overlay.update();
            player.update();
        },
        render: function () {
            if (!stageClear) {
                overlay.render();
                player.render();
            } else {
                //show stage clear screen
                bgContext.fillStyle = 'white';
                bgContext.fillRect(0, 0, canvas.width, canvas.height);
                bgContext.font = '5px Arial';
                bgContext.fillStyle = 'black';
                bgContext.fillText('Stage Clear', canvas.width / 2 - 100, canvas.height / 2);

            }
        }
    });

    loop.start();
});







