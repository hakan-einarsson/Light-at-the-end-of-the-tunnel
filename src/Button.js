export class Button {
    constructor(x, y, text) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.active = false;
    }

    toggle() {
        this.active = !this.active;
    }
}
