
import { MobileGameScene } from '@natewilcox/mobile-game';
import 'dotenv/config'

export class HUD extends MobileGameScene
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
}