export class FadingText {
    constructor(position, text, size) {
        this.position = position;
        this.text = text;
        this.size = size;
        this.opacity = 1;
    }

    reduceOpacity() {
        this.opacity -= 0.01;
    }
}