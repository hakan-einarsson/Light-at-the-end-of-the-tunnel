export function background(canvas, map) {
    const bgContext = canvas.getContext('2d');
    map.forEach(corridor => {
        bgContext.rect(corridor.x1, corridor.y1, corridor.width, corridor.height);
    }
    );
    bgContext.fillStyle = 'white';
    bgContext.fill();
    // bgContext.beginPath();
    // bgContext.arc(48, 14, 3, 0, 2 * Math.PI);
    // bgContext.fillStyle = 'rgba(0,0,0,0)';
    // bgContext.fill();
    // bgContext.lineWidth = 1;
    // bgContext.strokeStyle = 'red';
    // bgContext.stroke();
}

export function clearBackground(canvas) {
    const bgContext = canvas.getContext('2d');
    bgContext.clearRect(0, 0, canvas.width, canvas.height);
}

