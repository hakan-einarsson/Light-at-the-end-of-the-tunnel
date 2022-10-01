const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

let size = 128;
let offset = { x: 0, y: 0 };

let drawing = false;
let editing = false;
let version = 0;
const corridors = [[]];
let startPoint = null;
let endPoint = null;
let gems = [];
let switches = [];
let levelNumber = '';
let currentCorridor = null;
let time = 0;
let editCorridor = -1;
let editSwitch = false;
let editGem = false;
class Corridor {
    constructor(x, y, width, height) {
        this.x1 = x;
        this.x2 = x + width;
        this.y1 = y;
        this.y2 = y + height;
        this.width = width;
        this.height = height;
    }

    toString() {
        return `${this.x1}, ${this.y1}, ${this.width}, ${this.height}`;
    }
}

let startDrawing = false;
let draging = false;
let endDrawing = false;
let drawObject = null;
let showOnlyCorridors = false;


let mouseStartPosition = null;
let mouseDragPosition = null;
let mouseEndPosition = null;

const drawButton = document.getElementById('draw');
const stopButton = document.getElementById('stop');
const editButton = document.getElementById('edit');
const elMouseDown = document.getElementById('mouse-down');
const elMouseUp = document.getElementById('mouse-up');
const moveHorizontal = document.getElementsByClassName('move-horizontal');
const moveVertical = document.getElementsByClassName('move-vertical');
const editCorridorEl = document.getElementById('edit-corridor');
const editWidth = document.getElementById('edit-width');
const editHeight = document.getElementById('edit-height');
const deleteButton = document.getElementById('delete');
const printButton = document.getElementById('print');
const loadButton = document.getElementById('load');
const sizeInput = document.getElementById('size');
const offsetXInput = document.getElementById('offset-x');
const offsetYInput = document.getElementById('offset-y');
const drawObjectButtons = document.getElementsByClassName('draw-object');
const versionButton = document.getElementById('version-handler');
const addVersionButton = document.getElementById('add-version');
const currentVersionSelect = document.getElementById('versions');
const copyVersionButton = document.getElementById('copy-version');
const copyVersionsSelect = document.getElementById('copy-versions');
const deleteVersion = document.getElementById('delete-version');
const showOnlyCorridorsCheckbox = document.getElementById('corridors-only');
const levelTimeInput = document.getElementById('level-time');
const levelNumberInput = document.getElementById('level-number');
const timerInput = document.getElementById('level-timer');

currentVersionSelect.value = version;
copyVersionsSelect.value = version;
time = levelTimeInput.value;
levelNumber = levelNumberInput.value;

levelTimeInput.onchange = function () {
    time = parseInt(levelTimeInput.value);
};

levelNumberInput.onchange = function () {
    levelNumber = this.value;
};

showOnlyCorridorsCheckbox.onchange = function () {
    console.log(this.checked);
    showOnlyCorridors = showOnlyCorridorsCheckbox.checked;
}

versionButton.onclick = function () {
    const versionPanel = document.getElementById('versions-panel');
    if (versionPanel.style.display === 'none') {
        versionPanel.style.display = 'block';
    } else {
        versionPanel.style.display = 'none';
    }
};

addVersionButton.onclick = function () {
    corridors.push([]);
    version = corridors.length - 1;
    // currentVersionSelect.setAttribute('max', corridors.length - 1);
    currentVersionSelect.value = version;
    // copyVersionsSelect.setAttribute('max', corridors.length - 1);
    setSelectsMaxValue();
}

function setSelectsMaxValue() {
    copyVersionsSelect.setAttribute('max', corridors.length - 1);
    currentVersionSelect.setAttribute('max', corridors.length - 1);
}

currentVersionSelect.onchange = function () {
    version = this.value;
}

copyVersionButton.onclick = function () {
    corridors[copyVersionsSelect.value].forEach(corridor => {
        corridors[version].push(new Corridor(corridor.x1, corridor.y1, corridor.width, corridor.height));
    });
}

deleteVersion.onclick = function () {
    corridors.splice(version, 1);
    if (version > corridors.length - 1) {
        version = corridors.length - 1;
        currentVersionSelect.value = version;
    }
    setSelectsMaxValue();
}



for (const button of drawObjectButtons) {
    button.addEventListener('click', () => {
        drawObject = button.value;
    });
};

setCanvasSize();

//sizeInput on change event
sizeInput.onchange = function () {
    size = this.value;
    setCanvasSize();
}

//offsetInput on change event
offsetXInput.onchange = function () {
    //convert to number
    offset.x = parseInt(this.value);
}
offsetYInput.onchange = function () {
    offset.y = parseInt(this.value);
}


loadButton.onclick = function () {
    //load from textarea
    const textarea = document.getElementById('code');
    let text = textarea.value;
    const type = text.split('\n')[0];
    //remove first line
    text = text.split('\n').slice(1).join('\n');

    //remove brackets
    const textWithoutBrackets = text.replace(/[\[\]]/g, '');
    //split by commas
    const corridorsArray = textWithoutBrackets.split(',');
    if (type == "Corridors") {
        console.log()
        for (let i = 0; i < corridorsArray.length; i += 4) {
            const corridor = new Corridor(parseInt(corridorsArray[i]), parseInt(corridorsArray[i + 1]), parseInt(corridorsArray[i + 2]), parseInt(corridorsArray[i + 3]));
            corridors[version].push(corridor);
        }
        textarea.value = "";
    }
    if (type == "Switches") {
        for (let i = 0; i < corridorsArray.length; i += 2) {
            switches.push([parseInt(corridorsArray[i]), parseInt(corridorsArray[i + 1])]);
        }
        textarea.value = "";
    }    // console.log(text);
    if (type == "Gems") {
        for (let i = 0; i < corridorsArray.length; i += 2) {
            gems.push([parseInt(corridorsArray[i]), parseInt(corridorsArray[i + 1])]);
        }
        textarea.value = "";
    }
}


printButton.onclick = function () {
    let code = '[\n';
    code += `${levelNumber},\n`;
    code += `${size},\n`;
    code += '[\n';
    corridors.forEach(version => {
        code += '[\n';
        version.forEach(corridor => {
            code += `[${corridor.toString()}],\n`;
        });
        code += '],\n';
    });
    code = code.substring(0, code.length - 2);
    code += '\n],[';
    code += `${startPoint.x}, ${startPoint.y}], [${endPoint.x}, ${endPoint.y}],\n`;
    code += `${time},[`;
    switches.forEach(switchObj => {
        code += `[${switchObj[0]}, ${switchObj[1]}],`;
    });
    if (switches.length > 0) code = code.substring(0, code.length - 1);
    code += '],[';
    gems.forEach(gemObj => {
        code += `[${gemObj[0]}, ${gemObj[1]}],`;
    });
    if (gems.length > 0) code = code.substring(0, code.length - 1);
    code += '],';
    code += timerInput.value + '\n]';
    const textarea = document.getElementById('code');
    textarea.value = code;
}

deleteButton.onclick = function () {
    if (editCorridor > -1) {
        corridors[version].splice(editCorridor, 1);
        editCorridor = -1;
    }
    if (editSwitch > -1) {
        switches.splice(editSwitch, 1);
        editSwitch = -1;
    }
    if (editGem > -1) {
        gems.splice(editGem, 1);
        editGem = -1;
    }
}

editWidth.onclick = function () {
    if (editCorridor > -1) {
        corridors[version][editCorridor].width = parseInt(editWidth.value);
        corridors[version][editCorridor].x2 = corridors[version][editCorridor].x1 + corridors[version][editCorridor].width;
    }
}

editHeight.onclick = function () {
    if (editCorridor > -1) {
        corridors[version][editCorridor].height = parseInt(editHeight.value);
        corridors[version][editCorridor].y2 = corridors[version][editCorridor].y1 + corridors[version][editCorridor].height;
    }
}

for (const el of Object.values(moveHorizontal)) {
    el.addEventListener('click', function (e) {
        if (editCorridor > -1) {
            corridors[version][editCorridor].x1 += parseInt(e.target.getAttribute('data-value'));
            corridors[version][editCorridor].x2 += parseInt(e.target.getAttribute('data-value'));
        }
        if (editSwitch > -1) {
            switches[editSwitch][0] += parseInt(e.target.getAttribute('data-value'));
        }
        if (editGem > -1) {
            gems[editGem][0] += parseInt(e.target.getAttribute('data-value'));
        }
    });
};

for (const el of Object.values(moveVertical)) {
    el.addEventListener('click', function (e) {
        if (editCorridor > -1) {
            corridors[version][editCorridor].y1 += parseInt(e.target.getAttribute('data-value'));
            corridors[version][editCorridor].y2 += parseInt(e.target.getAttribute('data-value'));
        }
        if (editSwitch > -1) {
            switches[editSwitch][1] += parseInt(e.target.getAttribute('data-value'));
        }
        if (editGem > -1) {
            gems[editGem][1] += parseInt(e.target.getAttribute('data-value'));
        }

    });
};

drawButton.addEventListener('click', () => {
    drawing = true;
    editing = false;
    setButtonColors();
    displayDrawPanel();
    hideEditPanel();
});
stopButton.addEventListener('click', () => {
    drawing = false;
    editing = false;
    setButtonColors();
    hideEditPanel();
    hideDrawPanel();
    startDrawing = false;
    newCorridor = null;
    mouseStartPosition = null;
    mouseEndPosition = null;
});
editButton.addEventListener('click', () => {
    drawing = false;
    editing = true;
    setButtonColors();
    displayEditPanel();
    hideDrawPanel();
});

function setButtonColors() {
    drawButton.style.backgroundColor = !drawing ? '#efefef' : '#0d6efd';
    drawButton.style.color = !drawing ? 'black' : 'white';
    editButton.style.backgroundColor = !editing ? '#efefef' : '#0d6efd';
    editButton.style.color = !editing ? 'black' : 'white';
}

function displayDrawPanel() {
    const drawPanel = document.getElementById('draw-panel');
    drawPanel.style.display = 'block';
}

function hideDrawPanel() {
    const drawPanel = document.getElementById('draw-panel');
    drawPanel.style.display = 'none';
}

function displayEditPanel() {
    const editPanel = document.getElementById('edit-panel');
    editPanel.style.display = 'block';
}

function hideEditPanel() {
    const editPanel = document.getElementById('edit-panel');
    editPanel.style.display = 'none';
}

function setCanvasSize() {
    canvas.width = size;
    canvas.height = size;
    // canvas.style.maxWidth = size + 'px';
    sizeInput.value = size;
}




canvas.onclick = function (e) {
    let x = Math.floor(e.offsetX * (size / 512) + offset.x);
    let y = Math.floor(e.offsetY * (size / 512) + offset.y);
    if (drawing) {
        if (drawObject == 0) {
            editCorridor = -1;
            if (startDrawing) {
                mouseEndPosition = { x: x - 5, y: y - 5 };
                currentCorridor = new Corridor(x, y, 0, 0);
                startDrawing = false;
                endDrawing = true;
            } else {
                startDrawing = true;
                endDrawing = false;
                mouseStartPosition = { x: x - 5, y: y - 5 };
                mouseDragPosition = { x: x - 5, y: y - 5 };

            }
        }
        if (drawObject == 1) {
            startPoint = { x: x, y: y };
        }
        if (drawObject == 2) {
            endPoint = { x: x, y: y };
        }
        if (drawObject == 3) {
            switches.push([x - 5, y - 5]);
        }
        if (drawObject == 4) {
            gems.push([x, y]);
        }
    } else if (editing) {
        startDrawing = false;
        endDrawing = false;
        for (let i = 0; i < corridors[version].length; i++) {
            if (corridors[version][i].x1 <= x && corridors[version][i].x2 >= x && corridors[version][i].y1 <= y && corridors[version][i].y2 >= y) {
                editCorridor = i;
                editGem = -1;
                editSwitch = -1;
                editCorridorEl.innerHTML = 'Corridor: ' + JSON.stringify(corridors[version][i]);
                editWidth.value = corridors[version][i].width;
                editHeight.value = corridors[version][i].height;
                break;
            }
        }
        if (!showOnlyCorridors) {
            for (let i = 0; i < switches.length; i++) {
                let size = 10;
                if (switches[i][0] <= x && switches[i][0] + size >= x && switches[i][1] <= y && switches[i][1] + size >= y) {
                    editSwitch = i;
                    editGem = -1;
                    editCorridor = -1;
                    editCorridorEl.innerHTML = 'Switch: ' + JSON.stringify(switches[i]);
                    break;
                }
            }
            for (let i = 0; i < gems.length; i++) {
                let size = 10;
                if (gems[i][0] <= x && gems[i][0] + size >= x && gems[i][1] <= y && gems[i][1] + size >= y) {
                    editGem = i;
                    editSwitch = -1;
                    editCorridor = -1;
                    editCorridorEl.innerHTML = 'Gem: ' + JSON.stringify(gems[i]);
                    break;
                }
            }
        }
    } else {
        startDrawing = false;
        endDrawing = false;
        editCorridor = -1;
    }
}

//
canvas.onmousemove = function (e) {
    let x = Math.floor(e.offsetX * (size / 512) + offset.x);
    let y = Math.floor(e.offsetY * (size / 512) + offset.y);
    if (drawing) {
        if (startDrawing && drawObject == 0) {
            if (Math.abs(x - mouseStartPosition.x) > Math.abs(y - mouseStartPosition.y)) {
                mouseDragPosition.y = mouseStartPosition.y;
                mouseDragPosition.x = x;
            } else {
                mouseDragPosition.x = mouseStartPosition.x;
                mouseDragPosition.y = y;
            }
        }
        box.x = x - 5 - offset.x;
        box.y = y - 5 - offset.y;


    }
}

const box = { x: 0, y: 0, width: 10, height: 10 };

function gameLoop() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    if (drawing && drawObject == 0) {
        if (startDrawing && !endDrawing) {
            let startPosX = getStartPos(mouseStartPosition.x, mouseDragPosition.x);
            let endPosX = getEndPos(mouseStartPosition.x, mouseDragPosition.x)
            let goingLeft = goingLeftOrUp(mouseStartPosition.x, mouseDragPosition.x);
            let startPosY = getStartPos(mouseStartPosition.y, mouseDragPosition.y);
            let endPosY = getEndPos(mouseStartPosition.y, mouseDragPosition.y)
            let goingUp = goingLeftOrUp(mouseStartPosition.y, mouseDragPosition.y);
            let width = endPosX - startPosX;
            let height = endPosY - startPosY;
            let goingVertical = height > width;
            goingVertical ? width = 10 : goingLeft ? width += 10 : width += 0;
            goingVertical ? goingUp ? height += 10 : height += 0 : height = 10;
            currentCorridor = new Corridor(startPosX, startPosY, width, height);


        }
        if (endDrawing && !startDrawing) {
            startPosX = getStartPos(mouseStartPosition.x, mouseEndPosition.x);
            endPosX = getEndPos(mouseStartPosition.x, mouseEndPosition.x)
            let goingLeft = goingLeftOrUp(mouseStartPosition.x, mouseEndPosition.x);
            startPosY = getStartPos(mouseStartPosition.y, mouseEndPosition.y);
            endPosY = getEndPos(mouseStartPosition.y, mouseEndPosition.y)
            let goingUp = goingLeftOrUp(mouseStartPosition.y, mouseEndPosition.y);

            width = endPosX - startPosX;
            height = endPosY - startPosY;
            let goingVertical = height > width;
            if (goingVertical) {
                width = 10;
                goingUp ? height += 10 : height += 5;
                startPosX = mouseStartPosition.x;
            } else {
                goingLeft ? width += 10 : width += 5;
                height = 10;
                startPosY = mouseStartPosition.y;
            }

            corridors[version].push(new Corridor(startPosX, startPosY, width, height));
            startDrawing = true;
            if (goingVertical) {
                mouseDragPosition.x = mouseStartPosition.x;
                mouseStartPosition.y = mouseEndPosition.y;
                mouseDragPosition.y = mouseEndPosition.y;
            } else {
                mouseStartPosition.x = mouseEndPosition.x;
                mouseDragPosition.x = mouseEndPosition.x;
                mouseDragPosition.y = mouseStartPosition.y;
            }
            currentCorridor = new Corridor(mouseStartPosition.x, mouseStartPosition.y, 0, 0);
            endDrawing = false;
        }
    } else {
        startDrawing = false;
        currentCorridor = null;
        mouseStartPosition = null;
        mouseEndPosition = null;
        mouseDragPosition = null;
    }
    context.beginPath();
    corridors[version].forEach(corridor => {
        context.rect(corridor.x1 - offset.x, corridor.y1 - offset.y, corridor.width, corridor.height);
    });

    if (currentCorridor != null) {
        context.rect(currentCorridor.x1 - offset.x, currentCorridor.y1 - offset.y, currentCorridor.width, currentCorridor.height);
    }
    context.closePath();
    context.fillStyle = 'white';
    context.fill();
    if (!showOnlyCorridors) {
        if (startPoint != null) {
            context.beginPath();
            context.rect(startPoint.x - 5 - offset.x, startPoint.y - 5 - offset.y, 10, 10);
            context.closePath();
            context.fillStyle = 'red';
            context.fill();
        }
        if (endPoint != null) {
            context.beginPath();
            context.rect(endPoint.x - 5 - offset.x, endPoint.y - 5 - offset.y, 10, 10);
            context.closePath();
            context.fillStyle = 'blue';
            context.fill();
        }
        if (switches.length > 0) {
            context.beginPath();
            switches.forEach(switchPos => {
                context.rect(switchPos[0] - offset.x, switchPos[1] - offset.y, 10, 10);
            });
            context.closePath();
            context.fillStyle = 'green';
            context.fill();
        }
        if (gems.length > 0) {
            context.beginPath();
            gems.forEach(gemPos => {
                context.rect(gemPos[0] - 5 - offset.x, gemPos[1] - 5 - offset.y, 10, 10);
            });
            context.closePath();
            context.fillStyle = 'orange';
            context.fill();
        }
    }


    if (drawing) {
        context.beginPath();
        context.rect(box.x, box.y, box.width, box.height);
        if (drawObject == 0) {
            context.fillStyle = 'white';
        }
        if (drawObject == 1) {
            context.fillStyle = 'red';
        }
        if (drawObject == 2) {
            context.fillStyle = 'blue';
        }
        if (drawObject == 3) {
            context.fillStyle = 'green';
        }
        if (drawObject == 4) {
            context.fillStyle = 'orange';
        }
        context.closePath();
        context.fill();
    }
    document.getElementById('corridors').innerHTML = JSON.stringify(corridors);


    requestAnimationFrame(gameLoop);
}

function getStartPos(v1, v2) {
    return v1 < v2 ? v1 : v2;
}

function goingLeftOrUp(v1, v2) {
    return v1 > v2;
}

function getEndPos(v1, v2) {
    return v1 > v2 ? v1 : v2 + 5;
}

gameLoop();







