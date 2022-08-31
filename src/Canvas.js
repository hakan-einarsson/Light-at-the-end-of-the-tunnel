export class Canvas {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
    }
    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    draw(image, x, y, width, height) {
        this.context.drawImage(image, x, y, width, height);
    }
    drawText(text) {
        this.context.font = text.font;
        this.context.fillStyle = text.color;
        let width = this.context.measureText(text.text).width;
        let x = text.x - width / 2;
        this.context.fillText(text.text, x, text.y);
    }
    drawFadingText(fadingText) {
        // let text = fadingText.text;
        // let font = `${fadingText.size}px Arial`;
        // let color = `rgb(255, 255, 255, ${fadingText.opacity})`;
        // let x = fadingText.x;
        // let y = fadingText.y;

        this.drawText({
            text: fadingText.text,
            font: `${fadingText.size}px Arial`,
            color: `rgba(255, 255, 255, ${fadingText.opacity})`,
            x: fadingText.position[0],
            y: fadingText.position[1]
        });
    }
    drawPlayerLight(x, y, r, factor) {
        let outerRadius = this.canvas.width * (1 - factor) <= r * 3 ? r * 3 : this.canvas.width * (1 - factor);
        let innerRadius = r + this.canvas.width * 0.1 * (1 - factor);
        let gradient = this.context.createRadialGradient(x, y, innerRadius, x, y, outerRadius);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
        this.context.fillStyle = gradient;
        this.context.arc(x, y, this.canvas.width * 2, 0, Math.PI * 2);
        this.context.fill();
    }
    drawEndPoint(x, y, r) {
        let gradient = this.context.createRadialGradient(x, y, 0, x, y, r * 2);
        gradient.addColorStop(0, 'rgba(1, 1, 1, 0)');
        gradient.addColorStop(1, 'rgba(1, 1, 1, 1)');
        this.context.fillStyle = gradient;
        this.context.arc(x, y, r, 0, Math.PI * 2);
        this.context.fill();
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
    drawYouWinText() {
        let text = 'You win!';
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


    setSize(size) {
        this.canvas.width = size;
        this.canvas.height = size;
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

