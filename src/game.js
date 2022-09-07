import {
    init,
    GameLoop,
    setImagePath,
    initKeys,
    initGamepad,
} from 'kontra';
import { levels } from './levels.js';
import { Canvas } from './Canvas.js';
import { inputHandler, checkIfPlayerIsOnEndPoint, checkIfPlayerIsOnSwitch, checkIfPlayerIsOnGem, checkStartGame } from './inputHandler.js';
import { Timer } from './Timer.js';
import { preloadResources, drawEndPoint } from './GameUtilies.js';
import { FadingText } from './FadingText.js';
import { fadingTexts } from './fadingTexts.js';
import { pickupSound, newLevelSound } from './Sounds.js';
import { playMusic } from './Music.js';
import { SpriteFactory } from './SpriteFactory.js';
let { canvas, context } = init(document.getElementById('kontra'));
canvas.style.backgroundColor = 'rgba(0, 0, 0, 0)'
const backgroundCanvas = new Canvas(document.getElementById('background'));
const textLayerCanvas = new Canvas(document.getElementById('text-layer'));
const lightLayerCanvas = new Canvas(document.getElementById('light-layer'));
setImagePath('./assets/');
initKeys();
initGamepad();
preloadResources().then(images => {
    let music;
    let gameStarted = false;
    let startButton = null;
    // document.onclick = () => {
    //     startMusic();
    // }
    let currentLevel = 0;
    let currentLevelVersion = 0;
    let numberOfLevels = levels.length;
    let gems = [];
    const explodingGems = [];
    let levelTime = 0;
    let spriteFactory = new SpriteFactory(images[0]);
    const player = spriteFactory.getPlayer();
    const floorTile = images[1];
    const splash = images[2];
    let levelText = new FadingText([512 / 2, 512 / 2], `Level ${levels[currentLevel].name}`, 50);
    const timer = new Timer();
    const textTimer = new Timer();
    let deathAnimationTicker = 0;
    let deathAnimationTickerMax = 60;
    let deathAnimationTickerActive = false;
    let darkMode = false;
    let opacityChange = 0;
    let gameCleared = false;
    let stageLost = false;




    let loop = GameLoop({
        update: function () {
            if (gameStarted) {
                if (!gameCleared) {
                    if (timer.tick()) {
                        // print out timer.timeElapsed rounded up to one decimal place
                        let timeRounded = Math.round(timer.timeElapsed * 10) / 10;
                        if (timeRounded == levelTime - 5) {
                            darkMode = true;
                            textTimer.start();
                        }
                        if (timeRounded == levelTime) {
                            stageLost = true;
                            player.playAnimation('death');
                            deathAnimationTickerActive = true;
                        }
                    }
                    if (!stageLost) {
                        checkEndPoint();
                        checkSwitches();
                        checkGems();
                        checkExplodingGems();
                        inputHandler(player, levels[currentLevel].map[currentLevelVersion]);
                    }
                    player.update();
                }
            } else {
                if (checkStartGame(startButton)) {
                    startMusic();
                    gameStarted = true;
                    setLevelProperties(player);
                    drawLevelMap(floorTile);
                }
            }
        },
        render: function () {
            if (gameStarted) {
                if (!gameCleared) {
                    if (!stageLost) {
                        drawEndPoint(context, levels[currentLevel].endPoint);
                        textLayerCanvas.clear();
                        lightLayerCanvas.clear();
                        drawPlayerLight();
                        renderGems();
                        renderExplodingGems();


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
            } else {
                showStartScreen();
            }
        }
    });

    loop.start();


    //game loop functions
    function showStartScreen() {
        backgroundCanvas.setSize(128);
        backgroundCanvas.clear();
        backgroundCanvas.context.rect(0, 0, 128, 128);
        backgroundCanvas.context.fillStyle = '#000';
        backgroundCanvas.context.fill();
        backgroundCanvas.context.drawImage(splash, 14, 16);
        startButton = textLayerCanvas.drawButton(256, 350, 'Start')

    }
    function startMusic() {
        if (!music) {
            music = new playMusic();
        }
    }
    function stopMusic() {
        if (!!music) {
            music.stop();
        }
    }
    function checkEndPoint() {
        if (checkIfPlayerIsOnEndPoint(player, levels[currentLevel].endPoint)) {
            currentLevel++;
            if (currentLevel >= numberOfLevels) {
                currentLevel = 0;
                currentLevelVersion = 0;
                gameCleared = true;
                timer.reset();
            } else {
                newLevelSound();
                setLevelProperties(player);
                drawLevelMap(floorTile);
            }
        }
    }
    function checkSwitches() {
        levels[currentLevel].switches.forEach((switchObject, index) => {
            if (checkIfPlayerIsOnSwitch(player, switchObject)) {
                currentLevelVersion < levels[currentLevel].map.length - 1 ? currentLevelVersion++ : currentLevelVersion = 0;
                levels[currentLevel].delete('switches', index);
                drawLevelMap(floorTile);
            }
        });
    }
    function checkGems() {
        gems.forEach((gemObject, index) => {
            if (checkIfPlayerIsOnGem(player, [gemObject.x, gemObject.y])) {
                gems.splice(index, 1);
                explodingGems.push(spriteFactory.getExplodingGem([gemObject.x + 2, gemObject.y + 2]));
                timer.reset();
                timer.start();
                darkMode = false;
                textTimer.reset();
                resetFadingTexts();
                pickupSound();
            }
        });
    }
    function checkExplodingGems() {
        if (explodingGems.length > 0) {
            explodingGems.forEach((gem, index) => {
                gem.update();
                if (gem.animationOver()) {
                    explodingGems.splice(index, 1);
                }
            });
        }
    }

    function drawPlayerLight() {
        let opacityFactor = opacityChange * (timer.timeElapsed + 1) <= 1 ? opacityChange * (timer.timeElapsed + 1) : 1;
        lightLayerCanvas.drawPlayerLight(player.x + player.rad * 2, player.y + player.rad * 2, player.rad, opacityFactor);
    }

    function renderGems() {
        gems.forEach(gem => {
            gem.render();
        });
    }

    function renderExplodingGems() {
        if (explodingGems.length > 0) {
            explodingGems.forEach((gem) => {
                gem.render();
            });
        }
    }

    function resetFadingTexts() {
        fadingTexts.forEach(text => {
            text.reset();
        });
    }

    function setLevelProperties(player) {
        levelTime = levels[currentLevel].time;
        opacityChange = 1 / (levelTime - 3);
        player.setPosition(levels[currentLevel].startPoint[0], levels[currentLevel].startPoint[1]);
        backgroundCanvas.setSize(levels[currentLevel].size);
        lightLayerCanvas.setSize(levels[currentLevel].size);
        canvas.width = levels[currentLevel].size;
        canvas.height = levels[currentLevel].size;
        levels[currentLevel].gems.forEach((gem) => {
            gems.push(spriteFactory.getGem(gem));
        });
        currentLevelVersion = 0;
        timer.reset();
        timer.start();
        textTimer.reset();
        darkMode = false;
        resetFadingTexts();
        levelText = new FadingText([512 / 2, 512 / 2], 'Level ' + (levels[currentLevel].name), 50);
    }

    function drawLevelMap(floorTile) {
        if (currentLevel <= numberOfLevels) {
            levels[currentLevel].draw(backgroundCanvas, floorTile, currentLevelVersion);
        }
    }
});






