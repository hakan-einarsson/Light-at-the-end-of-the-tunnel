export class Timer {
    constructor() {
        this.timeElapsed = 0;
        this.isRunning = false;
        this.frames = 0;
    }

    tick() {
        if (this.isRunning) {
            this.frames++
            if (this.frames == 6) {
                this.timeElapsed += 0.1;
                this.frames = 0;
                return true;
            }
        }
        return false;
    }
    start() {
        this.isRunning = true;
    }
    reset() {
        this.timeElapsed = 0;
        this.frames = 0;
        this.isRunning = false;
    }
}