import { SpriteSheet, Sprite } from 'kontra'

export class SpriteFactory {
    constructor(image) {
        this.spriteSheet = new SpriteSheet({
            image: image,
            frameWidth: 16,
            frameHeight: 16,
            animations: {
                idle: {
                    frames: '0..3',
                    frameRate: 5,
                },
                death: {
                    frames: '3..7',
                    frameRate: 5,
                    loop: false
                },
                gem: {
                    frames: '8',
                    frameRate: 5,
                },
                gemDeath: {
                    frames: '9..12',
                    frameRate: 20,
                    loop: false,
                }
            }
        });
    }

    getPlayer() {
        const player = Sprite({
            x: 0,
            y: 0,
            rad: 4,
            animations: this.spriteSheet.animations,
            speed: 1,
            getPosition: function () {
                return { x: this.x + 8, y: this.y + 8 };
            },
            setPosition: function (x, y) {
                this.x = x - 8;
                this.y = y - 8;
            }
        });
        player.playAnimation('idle');
        return player;
    }

    getGem(position) {
        const sprite = new Sprite({
            x: position[0] - 8,
            y: position[1] - 8,
            animations: this.spriteSheet.animations
        });
        sprite.playAnimation('gem');
        return sprite;
    }
    getExplodingGem(position) {
        const sprite = new Sprite({
            x: position[0] - 8,
            y: position[1] - 8,
            animations: this.spriteSheet.animations,
            startTime: new Date().getTime(),
            animationOver: function () {
                let timeElapsed = new Date().getTime() - this.startTime;
                return timeElapsed > 200;
            }

        });
        sprite.playAnimation('gemDeath');
        return sprite;
    }

}