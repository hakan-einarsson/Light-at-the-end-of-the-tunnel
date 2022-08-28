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
import { Canvas } from './Canvas.js';
import { inputHandler } from './inputHandler.js';
import { Timer } from './Timer.js';

let { canvas } = init();
setImagePath('./../assets/images');
initKeys();
initGamepad();
let currentLevel = 0;

const backgroundCanvas = new Canvas(document.getElementById('background'));
const foregroundCanvas = new Canvas(document.getElementById('foreground'));


levels[currentLevel].draw(backgroundCanvas.canvas);
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

    const timer = new Timer();
    let timeElapsed = 0;
    let levelTime = 10;
    let opacityChange = 0.60 / (levelTime - 5);
    let stageLost = false;
    let loop = GameLoop({
        update: function () {
            if (timer.tick()) {

                if (timeElapsed <= 30) {
                    overlay.opacity += opacityChange;
                }
                if (timer.timeElapsed == levelTime) {
                    stageLost = true;
                }
            }

            inputHandler(player, levels[currentLevel].map);

            overlay.update();
            player.update();
        },
        render: function () {
            if (!stageLost) {
                overlay.render();
                player.render();
            } else {
                backgroundCanvas.clear();
                foregroundCanvas.drawYouLooseText();





            }
        }
    });

    loop.start();
});







