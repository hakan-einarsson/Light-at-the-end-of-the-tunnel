import {
    init,
    Sprite,
    GameLoop,
    setImagePath,
    SpriteSheet,
    initKeys,
    initGamepad,
} from 'kontra';
import { levels } from './levels.js';
import { Canvas } from './Canvas.js';
import { inputHandler, checkIfPlayerIsOnEndPoint, checkIfPlayerIsOnSwitch } from './inputHandler.js';
import { Timer } from './Timer.js';
import { preloadResources, drawEndPoint } from './GameUtilies.js';
import { FadingText } from './FadingText.js';
import { fadingTexts } from './fadingTexts.js';
import { playTestSound } from './Sounds.js';
import { playMusic } from './Music.js';
let { canvas, context } = init(document.getElementById('kontra'));
canvas.style.backgroundColor = 'rgba(0, 0, 0, 0)'
const backgroundCanvas = new Canvas(document.getElementById('background'));
const textLayerCanvas = new Canvas(document.getElementById('text-layer'));
const lightLayerCanvas = new Canvas(document.getElementById('light-layer'));
setImagePath('./../assets/');
initKeys();
initGamepad();


preloadResources().then(images => {
    let music;
    document.onclick = () => {
        startMusic();
    }
    let currentLevel = 0;
    let currentLevelVersion = 0;
    let isOnSwitch = false;
    let activeSwitch = null;
    let numberOfLevels = levels.length;
    let levelTime = 0;
    const spriteSheet = new SpriteSheet({
        image: images[0],
        frameWidth: 16,
        frameHeight: 16,
        animations: {
            idle: {
                frames: '0..3',
                frameRate: 5,
            },
            death: {
                frames: '3..7',
                frameRate: 5,

            }
        }
    });
    const player = getPlayer(spriteSheet);
    player.playAnimation('idle');
    const floorTile = images[1];
    setLevelProperties(player);
    drawLevelMap(floorTile);
    let levelText = new FadingText([512 / 2, 512 / 2], `Level ${levels[currentLevel].name}`, 50);
    const timer = new Timer();
    timer.start();
    const textTimer = new Timer();
    let deathAnimationTicker = 0;
    let deathAnimationTickerMax = 60;
    let deathAnimationTickerActive = false;
    let darkMode = false;
    let opacityChange = 1 / (levelTime - 5);
    let gameCleared = false;
    let stageLost = false;
    let loop = GameLoop({
        update: function () {
            if (!gameCleared) {
                if (timer.tick()) {
                    if (timer.timeElapsed <= 30) {
                    }
                    if (timer.timeElapsed == levelTime - 5) {
                        darkMode = true;
                        textTimer.start();

                    }
                    if (timer.timeElapsed == levelTime) {
                        stageLost = true;
                        player.playAnimation('death');
                        deathAnimationTickerActive = true;
                    }
                }
                if (!stageLost) {
                    if (checkIfPlayerIsOnEndPoint(player, levels[currentLevel].endPoint)) {
                        // playTestSound();
                        currentLevel++;
                        if (currentLevel >= numberOfLevels) {
                            currentLevel = 0;
                            gameCleared = true;
                            timer.reset();
                        } else {
                            setLevelProperties(player);
                            resetForNewLevel();
                            drawLevelMap(floorTile);
                        }
                    }
                    if (!isOnSwitch) {
                        levels[currentLevel].switches.forEach((switchObject, index) => {
                            if (checkIfPlayerIsOnSwitch(player, switchObject)) {
                                console.log('on switch');
                                isOnSwitch = true;
                                activeSwitch = index;
                                currentLevelVersion < levels[currentLevel].map.length - 1 ? currentLevelVersion++ : currentLevelVersion = 0;
                                drawLevelMap(floorTile);
                            }
                        });
                    } else {
                        if (!checkIfPlayerIsOnSwitch(player, levels[currentLevel].switches[activeSwitch])) {
                            isOnSwitch = false;
                            activeSwitch = null;
                        }
                    }
                    inputHandler(player, levels[currentLevel].map[currentLevelVersion]);
                }
                player.update();
            }
        },
        render: function () {
            if (!gameCleared) {
                if (!stageLost) {
                    drawEndPoint(context, levels[currentLevel].endPoint);
                    textLayerCanvas.clear();
                    lightLayerCanvas.clear();
                    let opacityFactor = opacityChange * (timer.timeElapsed + 1) <= 1 ? opacityChange * (timer.timeElapsed + 1) : 1;
                    lightLayerCanvas.drawPlayerLight(player.x + player.rad * 2, player.y + player.rad * 2, player.rad, opacityFactor);
                    player.render();
                    if (darkMode) {
                        textTimer.tick();
                        fadingTexts.forEach((text, index) => {
                            if (index <= textTimer.timeElapsed && text.opacity > 0) {
                                textLayerCanvas.drawFadingText(text);
                                text.reduceOpacity();
                            }
                        });
                    }
                    if (levelText.opacity) {
                        textLayerCanvas.drawFadingText(levelText);
                        levelText.reduceOpacity();
                    }
                } else {
                    if (deathAnimationTickerActive) {
                        deathAnimationTicker++;
                        if (deathAnimationTicker < deathAnimationTickerMax) {
                            player.render();
                            lightLayerCanvas.clear();
                            backgroundCanvas.clear();
                        } else {
                            backgroundCanvas.clear();
                            textLayerCanvas.clear();
                            textLayerCanvas.drawYouLooseText();
                            stopMusic();
                        }
                    }
                }


            } else {
                backgroundCanvas.clear();
                textLayerCanvas.clear();
                textLayerCanvas.drawYouWinText();
            }
        }
    });

    loop.start();

    function startMusic(music) {
        if (!music) {
            music = new playMusic();
        }
    }
    function stopMusic() {
        if (!!music) {
            music.stop();
        }
    }
    function getPlayer(spriteSheet) {
        return Sprite({
            x: 0,
            y: 0,
            rad: 4,
            animations: spriteSheet.animations,
            speed: 1,
            getPosition: function () {
                return { x: this.x + 8, y: this.y + 8 };
            },
            setPosition: function (x, y) {
                this.x = x - 8;
                this.y = y - 8;
            }
        });
    }
    function setLevelProperties(player) {
        levelTime = levels[currentLevel].time;
        player.setPosition(levels[currentLevel].startPoint[0], levels[currentLevel].startPoint[1]);
        backgroundCanvas.setSize(levels[currentLevel].size);
        lightLayerCanvas.setSize(levels[currentLevel].size);
        canvas.width = levels[currentLevel].size;
        canvas.height = levels[currentLevel].size;
    }

    function drawLevelMap(floorTile) {
        if (currentLevel <= numberOfLevels) {
            levels[currentLevel].draw(backgroundCanvas, floorTile, currentLevelVersion);
        }
    }

    function resetForNewLevel() {
        opacityChange = 1 / (levelTime - 5);
        currentLevelVersion = 0;
        timer.reset();
        timer.start();
        textTimer.reset();
        darkMode = false;
        levelText = new FadingText([512 / 2, 512 / 2], 'Level ' + (levels[currentLevel].name), 50);
    }
});






