import { Corridor } from "./Corridor";

export class Level {
    constructor(name, size, mapData, startPoint, endPoint, time, switches = [], gems = [], timer = 0) {
        this.name = name;
        this.size = size;
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.time = time;
        this.switches = switches;
        this.gems = gems;
        this.map = this.setUpMap(mapData);
        this.timer = timer;
        this.previosTime = 0;
    }

    setUpMap(mapData) {
        const versions = [];
        mapData.forEach(version => {
            const corridors = [];
            version.forEach(corridor => {
                corridors.push(new Corridor(corridor[0], corridor[1], corridor[2], corridor[3]));
            });
            versions.push(corridors);
        });
        return versions;
    }

    draw(canvas, image, version) {

        canvas.clear();
        canvas.width = this.size;
        canvas.height = this.size;
        const context = canvas.context;

        this.map[version].forEach(corridor => {

            if (corridor.width >= corridor.height) {
                for (let i = 0; i < Math.floor(corridor.width / 10); i++) {
                    context.drawImage(image, corridor.x1 + i * 10, corridor.y1, 10, 10);
                }
                if (corridor.width % 10 != 0) {
                    context.drawImage(image, corridor.x1 + Math.floor(corridor.width / 10) * 10, corridor.y1, corridor.width % 10, 10);
                }
            } else {
                for (let i = 0; i < Math.floor(corridor.height / 10); i++) {
                    context.drawImage(image, corridor.x1, corridor.y1 + i * 10, 10, 10);
                }
                if (corridor.height % 10 != 0) {
                    context.drawImage(image, corridor.x1, corridor.y1 + Math.floor(corridor.height / 10) * 10, 10, corridor.height % 10);
                }
            }
        }
        );
        context.fillStyle = 'grey';
        context.fill();
    }
    startTimer() {
        this.timerRunning = true;
        this.previosTime = new Date().getTime();
    }
    checkTimer() {
        if (this.timerRunning) {
            const currentTime = new Date().getTime();
            const elapsedTime = Math.floor((currentTime - this.previosTime) / 100);
            if (elapsedTime == this.timer) {
                this.previosTime = currentTime;
                return true;
            }
        }
        return false;
    }

    delete(type, index) {
        if (type === 'switches') {
            this.switches.splice(index, 1);
        }
        if (type === 'gems') {
            this.gems.splice(index, 1);
        }
    }
}