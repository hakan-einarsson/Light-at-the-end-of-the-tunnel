import { Corridor } from "./gameObjects";

export class Level {
    constructor(name, size, mapData) {
        this.name = name;
        this.size = size;
        this.map = this.setUpMap(mapData);
    }

    setUpMap(mapData) {
        const corridors = [];
        mapData.forEach(corridor => {
            corridors.push(new Corridor(corridor[0], corridor[1], corridor[2], corridor[3]));
        }
        );
        return corridors;
    }

    draw(canvas) {
        canvas.width = this.size;
        canvas.height = this.size;
        const context = canvas.getContext('2d');
        this.map.forEach(corridor => {
            context.rect(corridor.x1, corridor.y1, corridor.width, corridor.height);
        }
        );
        context.fillStyle = 'white';
        context.fill();
    }
}