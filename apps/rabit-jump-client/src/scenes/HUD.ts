
import { Scene } from '@natewilcox/phaser-nathan';
import 'dotenv/config'

export class HUD extends Scene
{
    fullscreen: Phaser.GameObjects.Image;

    constructor () {
        super('HUD');
    }

    preload() {

    }

    create () {

        //when the screen is resized, reset the hud
        this.onScreenResized(this.addHudElements);
        this.addHudElements();
    }

    private addHudElements = () => {

        if(this.fullscreen) {
            this.fullscreen.setPosition(this.game.canvas.width, 0);
            return;
        }

        this.fullscreen = this.addImage(this.game.canvas.width, 0, 'full-screen', this.toggleFullscreen);
        this.fullscreen.setScrollFactor(0);
        this.fullscreen.setScale(0.25, 0.25);
        this.fullscreen.setOrigin(1, 0);
        this.fullscreen.setAlpha(0.4);
    }

    addImage(x: number, y: number, frame: string, cb?: () => void) {

        const img = this.add.image(x, y, frame);
        img.setScale(0.5, 0.5);
        img.setOrigin(0.5);

        if(cb) {
            img.setInteractive();
            img.on('pointerdown', cb);
        }

        return img;
    }
}