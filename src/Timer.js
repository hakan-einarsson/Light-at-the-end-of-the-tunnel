export class Timer {
    constructor() {
        this.previousTime = new Date().getTime() / 1000;
        this.timeElapsed = 0;
        this.isRunning = false;
    }

    tick() {
        if (this.isRunning) {
            // let currentTime = new Date().getTime() / 1000;
            let currentTime = new Date().getTime() / 100
            if (Math.floor(currentTime - this.previousTime) != 0) {
                this.timeElapsed += 0.1;
                this.previousTime = currentTime;
                return true;
            }
        }
        return false;
    }
    start() {
        this.previousTime = new Date().getTime() / 1000;
        this.isRunning = true;
    }
    reset() {
        this.timeElapsed = 0;
        this.isRunning = false;
    }
}