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
import { Button } from './Button.js';
import { introText } from './introText.js';
import { Level } from './Level.js';
import { Text } from './Text.js';
let { canvas, context } = init(document.getElementById('kontra'));
canvas.style.backgroundColor = 'rgba(0, 0, 0, 0)'
//center canvas on screen
centerHorizontalOnScreen(canvas);
const backgroundCanvas = new Canvas(document.getElementById('background'));
centerHorizontalOnScreen(backgroundCanvas.canvas);
const textLayerCanvas = new Canvas(document.getElementById('text-layer'));
centerHorizontalOnScreen(textLayerCanvas.canvas);
const lightLayerCanvas = new Canvas(document.getElementById('light-layer'));
centerHorizontalOnScreen(lightLayerCanvas.canvas);
setImagePath('./assets/');
initKeys();
initGamepad();
preloadResources().then(images => {
    let music;
    /**
     * 0 - intro
     * 1 - start screen
     * 2 - game
     * 3 - dying
     * 4 - game over
     * 5 - game complete
     */
    let gameState = 0;
    let currentLevel = 0;
    let currentLevelVersion = 0;
    let currentLevelMap;
    let numberOfLevels = levels.length;
    let gems = [];
    let switches = [];
    const explodingGems = [];
    let levelTime = 0;
    let spriteFactory = new SpriteFactory(images[0]);
    const player = spriteFactory.getPlayer();
    const floorTile = images[1];
    const splash = images[2];
    let levelText;
    const timer = new Timer();
    const textTimer = new Timer();
    const introTextTimer = new Timer();
    const activeTexts = [];
    const activeFadingTexts = [];
    let deathAnimationTicker = 0;
    let deathAnimationTickerMax = 60;
    let darkMode = false;
    let opacityChange = 0;
    let gameCleared = false;
    let fireStart = false;

    let loop = GameLoop({
        update: function () {
            if (gameState == 0) {
                if (fireStart) {
                    fireStart = checkStartGame()
                    console.log(firestart)
                } else {
                    fireStart = checkStartGame()
                    if (checkStartGame()) {
                        gameState = 1;
                    }
                }
            }
            if (gameState == 1) {
                if (fireStart) {
                    fireStart = checkStartGame()
                } else {
                    fireStart = checkStartGame()
                    if (checkStartGame()) {
                        startMusic();
                        gameState = 2;
                        setLevelProperties(player);
                        drawLevelMap(floorTile);
                    }
                }
            }
            if (gameState == 2) {
                if (timer.tick()) {
                    let timeRounded = Math.round(timer.timeElapsed * 10) / 10;
                    if (timeRounded == levelTime - 5) {
                        darkMode = true;
                        textTimer.start();
                    }
                    if (timeRounded == levelTime) {
                        gameState = 3;
                        player.playAnimation('death');
                    }
                }
                if (currentLevelMap.checkTimer()) {
                    currentLevelVersion++;
                    if (currentLevelVersion >= currentLevelMap.map.length) {
                        currentLevelVersion = 0;
                    }
                }
                checkEndPoint();
                checkSwitches();
                checkGems();
                checkExplodingGems();
                if (!inputHandler(player, currentLevelMap.map[currentLevelVersion]) && !gameCleared) {
                    gameState = 3;
                    player.playAnimation('death');
                }
                player.update();
            }
            if (gameState == 3) {
                deathAnimationTicker++;
                if (deathAnimationTicker == deathAnimationTickerMax) {
                    deathAnimationTicker = 0;
                    gameState = 4;
                }
                player.update();
            }
        },
        render: function () {
            if (gameState == 0) {
                backgroundCanvas.setSize(128);
                textLayerCanvas.clear();
                if (!introTextTimer.isRunning) {
                    introTextTimer.start();
                }
                showIntro();
            }
            if (gameState == 1) {
                showStartScreen();
            }
            if (gameState == 2) {
                drawEndPoint(context, currentLevelMap.endPoint);
                textLayerCanvas.clear();
                lightLayerCanvas.clear();
                drawPlayerLight();
                renderGems();
                renderExplodingGems();
                player.render();
                if (levelText.opacity) {
                    textLayerCanvas.drawFadingText(levelText);
                    levelText.reduceOpacity();
                }
                if (darkMode) {
                    textTimer.tick();
                    fadingTexts.forEach((text, index) => {
                        if (index <= textTimer.timeElapsed && text.opacity > 0) {
                            textLayerCanvas.drawFadingText(text);
                            text.reduceOpacity();
                        }
                    });
                }
            }
            if (gameState == 3) {

                player.render();
                lightLayerCanvas.clear();
                backgroundCanvas.clear();
            }
            if (gameState == 4) {
                backgroundCanvas.clear();
                textLayerCanvas.clear();
                textLayerCanvas.drawYouLooseText();
                textLayerCanvas.drawButton(new Button(256, 350, 'Retry'))
                if (checkStartGame()) {
                    startMusic();
                    gameState = 2;
                    setLevelProperties(player);
                    player.playAnimation('idle');
                    drawLevelMap(floorTile);
                }
                stopMusic();
            }
            if (gameState == 5) {
                backgroundCanvas.clear();
                textLayerCanvas.clear();
                textLayerCanvas.drawYouWinText();
                stopMusic();
            }
        }
    });

    loop.start();


    //game loop functions
    function showIntro() {
        let fontSize = 16;
        introTextTimer.tick()
        let introTextIndex = Math.round(introTextTimer.timeElapsed * 10) / 10;
        if (introText[0].time == introTextIndex) {

            activeTexts.splice(0, activeTexts.length);
            introText[0].dialog.forEach((text) => {
                activeTexts.push(new Text(text.text, 256, 256 - fontSize + (fontSize + 10) * (activeTexts.length), fontSize, text.color));
            });
            introText.splice(0, 1);
        }
        drawTexts();
        if (introText.length == 0) {
            gameState = 1;
        }

    }

    function showStartScreen() {
        textLayerCanvas.clear();
        backgroundCanvas.setSize(128);
        backgroundCanvas.clear();
        backgroundCanvas.context.rect(0, 0, 128, 128);
        backgroundCanvas.context.fillStyle = '#000';
        backgroundCanvas.context.fill();
        backgroundCanvas.context.drawImage(splash, 14, 16);
        textLayerCanvas.drawButton(new Button(256, 350, 'Start'))

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
        if (checkIfPlayerIsOnEndPoint(player, currentLevelMap.endPoint)) {
            currentLevel++;
            if (currentLevel >= numberOfLevels) {
                currentLevel = 0;
                currentLevelVersion = 0;
                gameCleared = true;
                gameState = 5;
                timer.reset();
            } else {
                newLevelSound();
                setLevelProperties(player);
                drawLevelMap(floorTile);
            }
        }
    }
    function checkSwitches() {
        switches.forEach((switchObject, index) => {
            if (checkIfPlayerIsOnSwitch(player, switchObject)) {
                switches.splice(index, 1);
                currentLevelVersion < currentLevelMap.map.length - 1 ? currentLevelVersion++ : currentLevelVersion = 0;
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

    function drawTexts() {
        activeTexts.forEach((text, index) => {
            textLayerCanvas.drawText(text);
        });
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
        currentLevelMap = new Level(...levels[currentLevel]);
        currentLevelMap.timer > 0 && currentLevelMap.startTimer();
        levelTime = currentLevelMap.time;
        opacityChange = 1 / (levelTime - 3);
        player.setPosition(currentLevelMap.startPoint[0], currentLevelMap.startPoint[1]);
        backgroundCanvas.setSize(currentLevelMap.size);
        lightLayerCanvas.setSize(currentLevelMap.size);
        canvas.width = currentLevelMap.size;
        canvas.height = currentLevelMap.size;
        switches = [];
        gems = [];
        currentLevelMap.gems.forEach((gem) => {
            gems.push(spriteFactory.getGem(gem));
        });
        currentLevelMap.switches.forEach((switchObject) => {
            switches.push(switchObject);
        });
        currentLevelVersion = 0;
        timer.reset();
        timer.start();
        textTimer.reset();
        darkMode = false;
        resetFadingTexts();
        levelText = new FadingText([512 / 2, 512 / 2], 'Level ' + (currentLevelMap.name), 50);
    }

    function drawLevelMap(floorTile) {
        if (currentLevel <= numberOfLevels) {
            currentLevelMap.draw(backgroundCanvas, floorTile, currentLevelVersion);
        }
    }

});

function centerHorizontalOnScreen(canvas) {
    //get screen width
    let screenWidth = window.innerWidth;
    let sizeObjectCanvas = document.getElementById('text-layer');
    let sizeObjectCanvasWidth = sizeObjectCanvas.offsetWidth;
    //canvas width is 512, center it horizontally
    let horizontalOffset = (screenWidth - sizeObjectCanvasWidth) / 2;
    //set canvas horizontal offset
    canvas.style.left = horizontalOffset + 'px';

}



