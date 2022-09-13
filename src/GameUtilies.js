import { loadImage } from 'kontra'

export function preloadResources() {
    const resources = [
        loadImage('full-sheet.png'),
        loadImage('floor-export.png'),
        loadImage('splash.png')
    ];
    return Promise.all(resources);
}

export function drawEndPoint(context, endPoint) {
    let radialGradiant = context.createRadialGradient(endPoint[0], endPoint[1], 0, endPoint[0], endPoint[1], 10);
    radialGradiant.addColorStop(0, 'rgba(255, 255, 255, 1)');
    radialGradiant.addColorStop(1, 'rgba(255, 255, 255, 0)');
    context.beginPath();
    context.arc(endPoint[0], endPoint[1], 10, 0, Math.PI * 2);
    context.fillStyle = radialGradiant;
    context.fill();
}