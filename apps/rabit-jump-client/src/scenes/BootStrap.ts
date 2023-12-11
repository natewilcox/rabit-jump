
import 'dotenv/config'
import { Scene, ServerService } from '@natewilcox/phaser-nathan';
import { ClientMessages, IRoomState } from '@natewilcox/rabit-jump-shared';

export class BootStrap extends Scene
{
    private SERVER: ServerService<IRoomState, ClientMessages>;

    constructor () {
        super('bootstrap');
        
        const url = `${process.env.HOST}`;
        console.log(`Connecting to: ${url}`);
        
        this.SERVER = new ServerService(url);
    }

    preload() {
        this.load.tilemapTiledJSON("demo", "./maps/demo.json");
        this.load.image("background_tiles", "./images/tilesets/background_tiles_extruded.png");
        this.load.image("sky_tiles", "./images/tilesets/sky_tiles_extruded.png");
        this.load.image("spikes_tiles", "./images/tilesets/spikes_tiles_extruded.png");
        this.load.image("platform_tiles", "./images/tilesets/platform_tiles_extruded.png");
        this.load.image("items_tiles", "./images/tilesets/items_tiles.png");

        this.load.image("sky", "./images/tilesets/sky.png");
        this.load.image("sky2", "./images/tilesets/sky2.png");

        this.load.atlas("bunny", "sprites/bunny.png", "sprites/bunny.json");
        this.load.atlas("effects", "sprites/effects.png", "sprites/effects.json");
        this.load.atlas("bat", "sprites/bat.png", "sprites/bat.json");

        this.load.image("flash", "images/particles/flash.png");
        this.load.image("full-screen", "images/sprites/full-screen.png");
    }

    create () {
 
        this.scene.stop();
        this.scene.launch('game', {
            SERVER: this.SERVER
        });

        this.scene.launch('HUD');
    }
}