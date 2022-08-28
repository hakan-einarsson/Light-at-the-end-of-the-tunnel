export class Timer {
    constructor() {
        this.previousTime = new Date().getTime() / 1000;
        this.timeElapsed = 0;
    }

    tick() {
        let currentTime = new Date().getTime() / 1000;
        if (Math.floor(currentTime - this.previousTime) != 0) {
            this.timeElapsed++;
            this.previousTime = currentTime;
            return true;
        }
        return false;
    }
}