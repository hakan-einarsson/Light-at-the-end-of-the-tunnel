import { keyPressed, gamepadPressed, keyMap } from 'kontra';

export function inputHandler(player, corridors) {
    const direction = [0, 0];
    if (keyPressed(keyMap.ArrowDown) || keyPressed('s') || gamepadPressed('dpaddown')) {
        direction[1] += 1;
    }
    if (keyPressed(keyMap.ArrowUp) || keyPressed('w') || gamepadPressed('dpadup')) {
        direction[1] -= 1;
    }
    if (keyPressed(keyMap.ArrowLeft) || keyPressed('a') || gamepadPressed('dpadleft')) {
        direction[0] -= 1;
    }
    if (keyPressed(keyMap.ArrowRight) || keyPressed('d') || gamepadPressed('dpadright')) {
        direction[0] += 1;
    }
    const checkNextMove = checkIfNextMoveIsInCorridor(player, direction, corridors);
    console.log(checkNextMove[0])
    const directionAdjusted = [direction[0] * checkNextMove[0][0], direction[1] * checkNextMove[0][1]];
    move(player, directionAdjusted);
    return checkNextMove[1];
}

export function checkStartGame() {

    return keyPressed(keyMap.Space) || gamepadPressed('start')
}

export function toggleButtons(activeButton, buttons) {
    if (keyPressed(keyMap.ArrowLeft) || keyPressed('a') || gamepadPressed('dpadleft')) {
        let nextActiveButton = activeButton - 1 < 0 ? buttons.length - 1 : activeButton - 1;
        return [nextActiveButton, true];
    }
    if (keyPressed(keyMap.ArrowRight) || keyPressed('d') || gamepadPressed('dpadright')) {
        let nextActiveButton = activeButton + 1 > buttons.length - 1 ? 0 : activeButton + 1;
        return [nextActiveButton, true];
    }
    return [activeButton, false];
}

function checkIfNextMoveIsInCorridor(player, direction, corridors) {
    const position = player.getPosition();
    let onCorridorX = [false, false];
    let onCorridorY = [false, false];
    let inCorridor = [0, 0];
    let isOnPlatform = false;
    const nextPosition = { x: position.x + direction[0], y: position.y + direction[1] };
    // const bounds = [
    //     [nextPosition.x - player.rad, nextPosition.y - player.rad],
    //     [nextPosition.x - player.rad, nextPosition.y + player.rad],
    //     [nextPosition.x + player.rad, nextPosition.y - player.rad],
    //     [nextPosition.x + player.rad, nextPosition.y + player.rad]
    // ];
    for (let i = 0; i < corridors.length; i++) {
        if (direction[0] !== 0 && inCorridor[0] === 0) {
            if (direction[0] > 0) {
                let bounds = [
                    [nextPosition.x + player.rad, position.y - player.rad],
                    [nextPosition.x + player.rad, position.y + player.rad]
                ];
                checkCollision(bounds[0], corridors[i]) && (onCorridorX[0] = true);
                checkCollision(bounds[1], corridors[i]) && (onCorridorX[1] = true);
            } else {
                let bounds = [
                    [nextPosition.x - player.rad, position.y - player.rad],
                    [nextPosition.x - player.rad, position.y + player.rad]
                ];
                checkCollision(bounds[0], corridors[i]) && (onCorridorX[0] = true);
                checkCollision(bounds[1], corridors[i]) && (onCorridorX[1] = true);
            }
        }
        if (direction[1] !== 0 && inCorridor[1] === 0) {
            if (direction[1] > 0) {
                let bounds = [
                    [position.x - player.rad, nextPosition.y + player.rad],
                    [position.x + player.rad, nextPosition.y + player.rad]
                ];
                checkCollision(bounds[0], corridors[i]) && (onCorridorY[0] = true);
                checkCollision(bounds[1], corridors[i]) && (onCorridorY[1] = true);
            } else {
                let bounds = [
                    [position.x - player.rad, nextPosition.y - player.rad],
                    [position.x + player.rad, nextPosition.y - player.rad]
                ];
                checkCollision(bounds[0], corridors[i]) && (onCorridorY[0] = true);
                checkCollision(bounds[1], corridors[i]) && (onCorridorY[1] = true);
            }
        }

        if (onCorridorX[0] && onCorridorX[1]) inCorridor[0] = 1;
        if (onCorridorY[0] && onCorridorY[1]) inCorridor[1] = 1;

        if (!isOnPlatform) {
            if (position.x >= corridors[i].x1 - 1 && position.x <= corridors[i].x1 + corridors[i].width + 1
                && position.y >= corridors[i].y1 - 1 && position.y <= corridors[i].y1 + corridors[i].height + 1) {
                isOnPlatform = true;
            }
        }

    }
    return [inCorridor, isOnPlatform];
}

function checkCollision(pos, corridor) {
    return pos[0] >= corridor.x1 && pos[0] <= corridor.x2 && pos[1] >= corridor.y1 && pos[1] <= corridor.y2;
}

export function checkIfPlayerIsOnEndPoint(player, endPoint) {
    let endpointRadius = 3;
    const position = player.getPosition();
    const playerRadius = player.rad;
    if (position.x + playerRadius >= endPoint[0] - endpointRadius &&
        position.x - playerRadius <= endPoint[0] + endpointRadius &&
        position.y + playerRadius >= endPoint[1] - endpointRadius &&
        position.y - playerRadius <= endPoint[1] + endpointRadius) {
        return true;
    }
    return false;
}

export function checkIfPlayerIsOnSwitch(player, switchBounds) {
    const position = player.getPosition();
    const switchSize = 12;
    if (position.x > switchBounds[0] &&
        position.x < switchBounds[0] + switchSize &&
        position.y > switchBounds[1] &&
        position.y < switchBounds[1] + switchSize) {
        return true;
    } else {
        return false;
    }
}

export function checkIfPlayerIsOnGem(player, gem) {
    const gemAdjusted = [gem[0] + 8, gem[1] + 8];
    const position = player.getPosition();
    const gemRadius = 2;
    if (position.x + player.rad >= gemAdjusted[0] - gemRadius &&
        position.x - player.rad <= gemAdjusted[0] + gemRadius &&
        position.y + player.rad >= gemAdjusted[1] - gemRadius &&
        position.y - player.rad <= gemAdjusted[1] + gemRadius) {
        return true;
    }
    return false;
}


function move(player, direction) {
    if (direction[0] !== 0 && direction[1] !== 0) {
        player.x += direction[0] * player.speed / Math.sqrt(2);
        player.y += direction[1] * player.speed / Math.sqrt(2);
        player.x = Math.round(player.x);
        player.y = Math.round(player.y);
    } else {
        player.x += direction[0];
        player.y += direction[1];
    }
}