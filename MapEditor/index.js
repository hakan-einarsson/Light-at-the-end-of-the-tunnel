const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

let size = 128;

let drawing = false;
let editing = false;
const corridors = [];
let currentCorridor = null;
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
        // return `corridors.push(new Corridor(${this.x1}, ${this.y1}, ${this.width}, ${this.height}));`;
        // return `{x1: ${this.x1}, y1: ${this.y1}, width: ${this.width}, height: ${this.height}},`;
        return `${this.x1}, ${this.y1}, ${this.width}, ${this.height}`;
    }
}

let startDrawing = false;
let draging = false;
let endDrawing = false;


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
    const lines = text.split('\n');
    corridors.length = 0;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const values = line.split(',');
        corridors.push(new Corridor(values[0], values[1], values[2], values[3]));
    }
}


printButton.onclick = function () {
    let code = '[\n';
    corridors.forEach(corridor => {
        code += `[${corridor.toString()}],\n`;
    });
    code = code.substring(0, code.length - 2);
    code += '\n];';
    const textarea = document.getElementById('code');
    textarea.value = code;
}

deleteButton.onclick = function () {
    if (editCorridor > -1) {
        corridors.splice(editCorridor, 1);
        editCorridor = -1;
    }
}

editWidth.onclick = function () {
    if (editCorridor > -1) {
        corridors[editCorridor].width = parseInt(editWidth.value);
    }
}

editHeight.onclick = function () {
    if (editCorridor > -1) {
        corridors[editCorridor].height = parseInt(editHeight.value);
    }
}

for (const el of Object.values(moveHorizontal)) {
    el.addEventListener('click', function (e) {
        if (editCorridor > -1) {
            corridors[editCorridor].x1 += parseInt(e.target.getAttribute('data-value'));
            corridors[editCorridor].x2 += parseInt(e.target.getAttribute('data-value'));
        }
    });
};

for (const el of Object.values(moveVertical)) {
    el.addEventListener('click', function (e) {
        if (editCorridor > -1) {
            corridors[editCorridor].y1 += parseInt(e.target.getAttribute('data-value'));
            corridors[editCorridor].y2 += parseInt(e.target.getAttribute('data-value'));
        }
    });
};

drawButton.addEventListener('click', () => {
    drawing = true;
    editing = false;
    setButtonColors();
    hideEditPanel();
});
stopButton.addEventListener('click', () => {
    drawing = false;
    editing = false;
    setButtonColors();
    hideEditPanel();
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
});

function setButtonColors() {
    drawButton.style.backgroundColor = !drawing ? '#efefef' : '#0d6efd';
    drawButton.style.color = !drawing ? 'black' : 'white';
    editButton.style.backgroundColor = !editing ? '#efefef' : '#0d6efd';
    editButton.style.color = !editing ? 'black' : 'white';
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
    } else if (editing) {
        startDrawing = false;
        endDrawing = false;
        for (let i = 0; i < corridors.length; i++) {
            if (corridors[i].x1 <= e.offsetX && corridors[i].x2 >= e.offsetX && corridors[i].y1 <= e.offsetY && corridors[i].y2 >= e.offsetY) {
                editCorridor = i;
                editCorridorEl.innerHTML = JSON.stringify(corridors[i]);
                editWidth.value = corridors[i].width;
                editHeight.value = corridors[i].height;
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
        if (startDrawing) {
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
    if (drawing) {
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
            corridors.push(new Corridor(startPosX, startPosY, width > height ? width : 10, height > width ? height : 10));
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
    corridors.forEach(corridor => {
        context.rect(corridor.x1, corridor.y1, corridor.width, corridor.height);
    });

    if (currentCorridor != null) {
        context.rect(currentCorridor.x1, currentCorridor.y1, currentCorridor.width, currentCorridor.height);
    }

    drawing && context.rect(box.x, box.y, box.width, box.height);
    context.fillStyle = 'white';
    context.fill();
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







