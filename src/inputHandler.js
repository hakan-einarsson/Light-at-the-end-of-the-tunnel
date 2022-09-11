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
    const checkNextMove = checkIfNextMoveIsInCorridor(player, direction, corridors)
    checkNextMove[0] && move(player, direction);
    return checkNextMove[1];
}

export function checkStartGame(button) {
    if (keyPressed(keyMap.Space) || gamepadPressed('south') || gamepadPressed('start')) {
        return true;
    }
    return false;
}

function checkIfNextMoveIsInCorridor(player, direction, corridors) {
    const position = player.getPosition();
    let inCorridor = false;
    let isOnPlatform = false;
    const nextPosition = { x: position.x + direction[0], y: position.y + direction[1] };
    for (let i = 0; i < corridors.length; i++) {
        if (!inCorridor) {
            if (nextPosition.x > corridors[i].x1 && nextPosition.x <= corridors[i].x1 + corridors[i].width
                && nextPosition.y > corridors[i].y1 && nextPosition.y <= corridors[i].y1 + corridors[i].height) {
                inCorridor = true;
            }
        }
        if (!isOnPlatform) {
            if (position.x > corridors[i].x1 - 1 && position.x < corridors[i].x1 + corridors[i].width + 1
                && position.y > corridors[i].y1 - 1 && position.y < corridors[i].y1 + corridors[i].height + 1) {
                isOnPlatform = true;
            }
        }

    }
    return [inCorridor, isOnPlatform];
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
    const position = player.getPosition();
    const gemRadius = 4;
    if (position.x + player.rad >= gem[0] + 2 - gemRadius &&
        position.x - player.rad <= gem[0] + 2 + gemRadius &&
        position.y + player.rad >= gem[1] + 2 - gemRadius &&
        position.y - player.rad <= gem[1] + 2 + gemRadius) {
        return true;
    }
    return false;
}


function move(player, direction) {
    player.x += direction[0];
    player.y += direction[1];
}