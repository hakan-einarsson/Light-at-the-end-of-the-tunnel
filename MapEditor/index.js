const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

let size = 128;

let drawing = false;
let editing = false;
let version = 0;
const corridors = [[]];
let startPoint = { x: 0, y: 0 };
let endPoint = { x: 0, y: 0 };
let gems = [];
let switches = [];
let levelNumber = 1;
let currentCorridor = null;
let time = 0;
let editCorridor = -1;
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
const drawObjectButtons = document.getElementsByClassName('draw-object');
const versionButton = document.getElementById('version-handler');
const addVersionButton = document.getElementById('add-version');
const currentVersionSelect = document.getElementById('versions');
const copyVersionButton = document.getElementById('copy-version');
const copyVersionsSelect = document.getElementById('copy-versions');
const deleteVersion = document.getElementById('delete-version');

currentVersionSelect.value = version;
copyVersionsSelect.value = version;

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
    corridors[version] = [...corridors[copyVersionsSelect.value]];
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

loadButton.onclick = function () {
    //load from textarea
    const textarea = document.getElementById('code');
    const text = textarea.value;
    //from json
    const json = JSON.parse(text);
    console.log(json)
    // const lines = text.split('\n');
    // corridors.length = 0;
    // for (let i = 0; i < lines.length; i++) {
    //     const line = lines[i];
    //     const values = line.split(',');
    //     corridors.push(new Corridor(values[0], values[1], values[2], values[3]));
    // }
}


printButton.onclick = function () {
    let code = 'new Level(\n';
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
    code += '],[';
    gems.forEach(gemObj => {
        code += `[${gemObj[0]}, ${gemObj[1]}]`;
    });
    code += '])';
    const textarea = document.getElementById('code');
    textarea.value = code;
}

deleteButton.onclick = function () {
    if (editCorridor > -1) {
        corridors[version].splice(editCorridor, 1);
        editCorridor = -1;
    }
}

editWidth.onclick = function () {
    if (editCorridor > -1) {
        corridors[version][editCorridor].width = parseInt(editWidth.value);
    }
}

editHeight.onclick = function () {
    if (editCorridor > -1) {
        corridors[version][editCorridor].height = parseInt(editHeight.value);
    }
}

for (const el of Object.values(moveHorizontal)) {
    el.addEventListener('click', function (e) {
        if (editCorridor > -1) {
            corridors[version][editCorridor].x1 += parseInt(e.target.getAttribute('data-value'));
            corridors[version][editCorridor].x2 += parseInt(e.target.getAttribute('data-value'));
        }
    });
};

for (const el of Object.values(moveVertical)) {
    el.addEventListener('click', function (e) {
        if (editCorridor > -1) {
            corridors[version][editCorridor].y1 += parseInt(e.target.getAttribute('data-value'));
            corridors[version][editCorridor].y2 += parseInt(e.target.getAttribute('data-value'));
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
    canvas.style.maxWidth = size + 'px';
    sizeInput.value = size;
}




canvas.onclick = function (e) {

    if (drawing) {
        if (drawObject == 0) {
            editCorridor = -1;
            if (startDrawing) {
                mouseEndPosition = { x: e.offsetX - 5, y: e.offsetY - 5 };
                currentCorridor = new Corridor(e.offsetX, e.offsetY, 0, 0);
                startDrawing = false;
                endDrawing = true;
            } else {
                startDrawing = true;
                endDrawing = false;
                mouseStartPosition = { x: e.offsetX - 5, y: e.offsetY - 5 };
                mouseDragPosition = { x: e.offsetX - 5, y: e.offsetY - 5 };

            }
        }
        if (drawObject == 1) {
            startPoint = { x: e.offsetX, y: e.offsetY };
        }
        if (drawObject == 2) {
            endPoint = { x: e.offsetX, y: e.offsetY };
        }
        if (drawObject == 3) {
            switches.push([e.offsetX - 5, e.offsetY - 5]);
        }
        if (drawObject == 4) {
            gems.push([e.offsetX - 5, e.offsetY - 5]);
        }
    } else if (editing) {
        startDrawing = false;
        endDrawing = false;
        for (let i = 0; i < corridors[version].length; i++) {
            if (corridors[version][i].x1 <= e.offsetX && corridors[version][i].x2 >= e.offsetX && corridors[version][i].y1 <= e.offsetY && corridors[version][i].y2 >= e.offsetY) {
                editCorridor = i;
                editCorridorEl.innerHTML = JSON.stringify(corridors[version][i]);
                editWidth.value = corridors[version][i].width;
                editHeight.value = corridors[version][i].height;
                break;
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
    if (drawing) {
        if (startDrawing && drawObject == 0) {
            if (Math.abs(e.offsetX - mouseStartPosition.x) > Math.abs(e.offsetY - mouseStartPosition.y)) {
                mouseDragPosition.y = mouseStartPosition.y;
                mouseDragPosition.x = e.offsetX;
            } else {
                mouseDragPosition.x = mouseStartPosition.x;
                mouseDragPosition.y = e.offsetY;
            }
            // mouseDragPosition = { x: e.offsetX, y: e.offsetY };
        }
        box.x = e.offsetX - 5;
        box.y = e.offsetY - 5;


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
            let startPosY = getStartPos(mouseStartPosition.y, mouseDragPosition.y);
            let endPosY = getEndPos(mouseStartPosition.y, mouseDragPosition.y)
            let width = endPosX - startPosX;
            let height = endPosY - startPosY;
            currentCorridor = new Corridor(startPosX, startPosY, width > height ? width : 10, height > width ? height : 10);


        }
        if (endDrawing && !startDrawing) {
            startPosX = getStartPos(mouseStartPosition.x, mouseEndPosition.x);
            endPosX = getEndPos(mouseStartPosition.x, mouseEndPosition.x)
            startPosY = getStartPos(mouseStartPosition.y, mouseEndPosition.y);
            endPosY = getEndPos(mouseStartPosition.y, mouseEndPosition.y)
            width = endPosX - startPosX;
            height = endPosY - startPosY;
            corridors[version].push(new Corridor(startPosX, startPosY, width > height ? width : 10, height > width ? height : 10));
            startDrawing = true;
            mouseStartPosition.x = mouseEndPosition.x;
            mouseDragPosition.x = mouseEndPosition.x;
            mouseStartPosition.y = mouseEndPosition.y;
            mouseDragPosition.y = mouseEndPosition.y;
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
        context.rect(corridor.x1, corridor.y1, corridor.width, corridor.height);
    });

    if (currentCorridor != null) {
        context.rect(currentCorridor.x1, currentCorridor.y1, currentCorridor.width, currentCorridor.height);
    }
    context.closePath();
    context.fillStyle = 'white';
    context.fill();
    if (startPoint != null) {
        context.beginPath();
        context.rect(startPoint.x - 5, startPoint.y - 5, 10, 10);
        context.closePath();
        context.fillStyle = 'red';
        context.fill();
    }
    if (endPoint != null) {
        context.beginPath();
        context.rect(endPoint.x - 5, endPoint.y - 5, 10, 10);
        context.closePath();
        context.fillStyle = 'blue';
        context.fill();
    }
    if (switches.length > 0) {
        context.beginPath();
        switches.forEach(switchPos => {
            context.rect(switchPos[0], switchPos[1], 10, 10);
        });
        context.closePath();
        context.fillStyle = 'green';
        context.fill();
    }
    if (gems.length > 0) {
        context.beginPath();
        gems.forEach(gemPos => {
            context.rect(gemPos[0], gemPos[1], 10, 10);
        });
        context.closePath();
        context.fillStyle = 'orange';
        context.fill();
    }


    if (drawing) {
        context.beginPath();
        context.rect(box.x, box.y, box.width, box.height);
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

function getEndPos(v1, v2) {
    return v1 > v2 ? v1 : v2 + 10;
}

gameLoop();







