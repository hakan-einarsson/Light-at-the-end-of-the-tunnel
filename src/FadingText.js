export class FadingText {
    constructor(position, text, size, left = false) {
        this.position = position;
        this.text = text;
        this.size = size;
        this.opacity = 1;
        this.left = left;
    }

    reduceOpacity(factor = 1) {
        this.opacity -= 0.01 / factor;
    }

    reset() {
        this.opacity = 1;
    }
}