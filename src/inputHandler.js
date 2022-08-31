import { keyPressed, gamepadPressed, keyMap } from 'kontra';

export function inputHandler(player, corridors) {
    const direction = [0, 0];
    if (keyPressed(keyMap.ArrowDown) || gamepadPressed('dpaddown')) {
        direction[1] += 1;
    }
    if (keyPressed(keyMap.ArrowUp) || gamepadPressed('dpadup')) {
        direction[1] -= 1;
    }
    if (keyPressed(keyMap.ArrowLeft) || gamepadPressed('dpadleft')) {
        direction[0] -= 1;
    }
    if (keyPressed(keyMap.ArrowRight) || gamepadPressed('dpadright')) {
        direction[0] += 1;
    }
    checkIfNextMoveIsInCorridor(player, direction, corridors) && move(player, direction);
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
    if (position.x + playerRadius >= endPoint[0] - endpointRadius && position.x - playerRadius <= endPoint[0] + endpointRadius && position.y + playerRadius >= endPoint[1] - endpointRadius && position.y - playerRadius <= endPoint[1] + endpointRadius) {
        return true;
    }
    return false;
}


function move(player, direction) {
    player.x += direction[0];
    player.y += direction[1];
}