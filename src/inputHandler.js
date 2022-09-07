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
    checkIfNextMoveIsInCorridor(player, direction, corridors) && move(player, direction);
}

export function checkStartGame(button) {
    if (keyPressed(keyMap.Space) || gamepadPressed('south') || gamepadPressed('start')) {
        return true;
    }
    return false;
}

function checkIfNextMoveIsInCorridor(player, direction, corridors) {
    const position = player.getPosition();
    const nextPosition = { x: position.x + direction[0], y: position.y + direction[1] };
    for (let i = 0; i < corridors.length; i++) {
        if (nextPosition.x >= corridors[i].x1 && nextPosition.x <= corridors[i].x2 && nextPosition.y >= corridors[i].y1 && nextPosition.y <= corridors[i].y2) {
            return true;
        }
    }
    return false;
}

export function checkIfPlayerIsOnEndPoint(player, endPoint) {
    let endpointRadius = 5;
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
    const switchSize = 11;
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
    const gemRadius = 6;
    if (position.x + player.rad >= gem[0] + 3 - gemRadius &&
        position.x - player.rad <= gem[0] + 3 + gemRadius &&
        position.y + player.rad >= gem[1] + 3 - gemRadius &&
        position.y - player.rad <= gem[1] + 3 + gemRadius) {
        return true;
    }
    return false;
}


function move(player, direction) {
    player.x += direction[0];
    player.y += direction[1];
}