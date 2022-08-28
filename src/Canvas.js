export class Canvas {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
    }
    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    draw(sprite) {
        this.context.drawImage(sprite.image, sprite.x, sprite.y);
    }
    drawText(text) {
        this.context.font = text.font;
        this.context.fillStyle = text.color;
        let width = this.context.measureText(text.text).width;
        let x = text.x - width / 2;
        this.context.fillText(text.text, x, text.y);
    }
    drawYouLooseText() {
        let text = 'Life was never for you...';
        let size = this.canvas.height / 12;
        let font = `${size}px Arial`;
        let x = this.canvas.width / 2;
        let y = this.canvas.height / 2;

        this.drawText({
            text: text,
            font: font,
            color: 'white',
            x: x,
            y: y
        });
    }

}

// export function clearBackground(canvas) {
//     const bgContext = canvas.getContext('2d');
//     bgContext.clearRect(0, 0, canvas.width, canvas.height);
// }


// export function getTextWidth(text, font) {
//     const canvas = document.createElement('canvas');
//     const context = canvas.getContext('2d');
//     context.font = font;
//     return context.measureText(text).width;
// }

