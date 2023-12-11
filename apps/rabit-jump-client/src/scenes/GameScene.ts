import { Scene, ServerService } from "@natewilcox/phaser-nathan";
import { createBatAnims } from "../anims/BatAnims";
import { createBunnyAnims } from "../anims/BunnyAnims";
import { createEffectsAnims } from "../anims/EffectsAnims";
import { ClientMessages, IRoomState, IServerObjectState, OBJECT_TYPES, ObjectType, ServerMessages } from "@natewilcox/rabit-jump-shared";


export class GameScene extends Scene
{
    DEFAULT_HEIGHT = 800;
    DEFAULT_WIDTH = 800;
    
    spriteByServerObjectId = new Map<string, Phaser.Physics.Arcade.Sprite>();
    serverObjects: Phaser.Physics.Arcade.Group;
    animatedTiles: any;
    map: Phaser.Tilemaps.Tilemap;

    backgrounds: { scroll: number, ratioX: number, ratioY: number, sprite: Phaser.GameObjects.TileSprite }[] = [];

    burstEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    flashEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    bodyPartsEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

    private SERVER: ServerService<IRoomState, ClientMessages>;

    private particleAngule = 0;

    playBurstEffect(x: number, y: number) {

        this.burstEmitter.setVisible(true);
        this.burstEmitter.explode(20, x, y);
        this.burstEmitter.stop();
    }

    playDeathEffect(x: number, y: number, dir: Phaser.Math.Vector2) {

        //dir.normalize();
        //dir.scale(1000);

        this.bodyPartsEmitter.setVisible(true);
        //this.bodyPartsEmitter.setGravityX(dir.x);
        this.bodyPartsEmitter.explode(10, x, y);
        this.bodyPartsEmitter.stop();

        this.flashEmitter.setVisible(true);
        this.flashEmitter.explode(10, x, y);
        this.flashEmitter.stop();
    }

    constructor () {
        super('game');
    }

    async preload () {
   
        this.load.scenePlugin('AnimatedTiles', 'js/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
    }

    async create (config: { SERVER: ServerService<IRoomState, ClientMessages> }) {
        
        this.configureResize(this);
        this.createMap(this);
        this.configureAnimations(this);

        //connect to server when scene is ready
        await this.connectToServer(config);
    }

    private async connectToServer(config: { SERVER: ServerService<IRoomState, ClientMessages> }) {

        try {

            this.SERVER = config.SERVER;
            await this.SERVER.connect('rabit_room');
        
            //add handlers for changes to server objects.
            this.SERVER.state.serverObjects.onAdd(this.onAddHandler);
            this.SERVER.state.serverObjects.forEach(this.onAddHandler);
            this.SERVER.state.serverObjects.onRemove(this.onRemoveHandler);

            //configure swipe controls
            let swipeStartX = 0;
            let swipeStartY = 0;

            this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
                swipeStartX = pointer.x;
                swipeStartY = pointer.y;
            });

            this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
                let swipeEndX = pointer.x;
                let swipeEndY = pointer.y;
                const directionVector = new Phaser.Math.Vector2(swipeEndX - swipeStartX, swipeEndY - swipeStartY);
          
                this.SERVER.send(ClientMessages.JumpCommand, {
                    x: Math.floor(directionVector.x),
                    y: Math.floor(directionVector.y)
                });
            });
 
            //recieving message from server
            this.SERVER.on(ServerMessages.BunnyIdle, (data) => {

                console.log(`${data.id} is idle`);
                const serverObjectSprite = this.serverObjects.getChildren().find(serverObject => serverObject.getData("id") == data.id) as Phaser.Physics.Arcade.Sprite;

                this.tweenToThen(serverObjectSprite, data.x, data.y, () => {
                    serverObjectSprite.anims.play('idle', true);
                });
            });

            this.SERVER.on(ServerMessages.BunnyJumped, (data) => {

                console.log(`${data.id} jumped`);
                const serverObjectSprite = this.serverObjects.getChildren().find(serverObject => serverObject.getData("id") == data.id) as Phaser.Physics.Arcade.Sprite;
                
                this.tweenToThen(serverObjectSprite, data.x, data.y, () => {
                    serverObjectSprite.anims.play('jump', true);
                });
            });

            this.SERVER.on(ServerMessages.BunnyDied, (data) => {

                console.log(`${data.id} just died`);
                const serverObjectSprite = this.serverObjects.getChildren().find(serverObject => serverObject.getData("id") == data.id) as Phaser.Physics.Arcade.Sprite;
                const dir = new Phaser.Math.Vector2(data.x - serverObjectSprite.x, data.y - serverObjectSprite.y);

                this.tweenToThen(serverObjectSprite, data.x, data.y, () => {
                    this.playDeathEffect(data.x, data.y, dir); 
                    serverObjectSprite.alpha = 0;
                });
            });

            this.SERVER.on(ServerMessages.BunnyGhost, (data) => {

                console.log(`${data.id} is a ghost`);
                const serverObjectSprite = this.serverObjects.getChildren().find(serverObject => serverObject.getData("id") == data.id) as Phaser.Physics.Arcade.Sprite;
                serverObjectSprite.anims.play('ghost', true);

                //fade in the ghost
                this.tweens.add({
                    targets: serverObjectSprite,
                    props: {
                        alpha: 0.5
                    },
                    delay: 1000,
                    duration: 1000
                })
            });

            this.SERVER.on(ServerMessages.BunnyReset, (data) => {

                console.log(`${data.id} was reset`);
                const serverObjectSprite = this.serverObjects.getChildren().find(serverObject => serverObject.getData("id") == data.id) as Phaser.Physics.Arcade.Sprite;
                serverObjectSprite.anims.play('idle', true);
                serverObjectSprite.alpha = 1;

                this.playBurstEffect(data.x, data.y);
            });
        }
        catch(e) {
            console.error("unable to start game scene", e);
        }
    }

    private onAddHandler = (serverObjectState: IServerObjectState) => {

        const serverObjectSprite: Phaser.Physics.Arcade.Sprite = this.serverObjects.get(serverObjectState.x, serverObjectState.y, OBJECT_TYPES[serverObjectState.objectType]);
        serverObjectSprite.setData("id", serverObjectState.id);

        switch(serverObjectState.objectType) {

            case ObjectType.Bunny :
                serverObjectSprite.setSize(25, 70);
                serverObjectSprite.anims.play('idle', true);
                break;
            
            case ObjectType.Bat : 
                    serverObjectSprite.setSize(10, 10);
                    serverObjectSprite.anims.play('sitting', true);
                break;
        }

        this.spriteByServerObjectId.set(serverObjectState.id, serverObjectSprite);

        let lastX = 0;
        let lastY = 0;
        let lastUpdate = new Date();
        let movementTween: Phaser.Tweens.Tween = null;

        serverObjectState.onChange(() => {

            const newX = serverObjectState.x;
            const newY = serverObjectState.y;
            const now = new Date();
            const timeout = now.getTime() - lastUpdate.getTime();
            lastUpdate = now;
      
            // if(timeout > 100) 
            //     console.warn(`moving to {${Math.floor(newX)},${Math.floor(newY)}} in ${timeout}ms`)
            // else
            //     console.log(`moving to {${Math.floor(newX)},${Math.floor(newY)}} in ${timeout}ms`)
            
            //stop the current tween before we move again.
            if(movementTween) {
                movementTween.stop();
            }

            //if no interupt flag is set, do not add additional tweens.
            // if(serverObjectSprite.getData("no_interupt") == true) {
            //     console.log("not interrupting tween")
            //     return;
            // }

            //start movement at last known server position
            serverObjectSprite.setPosition(lastX, lastY);

            //tween to new position
            movementTween = this.tweens.add({
                targets: serverObjectSprite,
                x: newX,
                y: newY,
                duration: timeout,
                ease: 'linear'
            });
    
            lastX = serverObjectState.x;
            lastY = serverObjectState.y;
        });

        if(this.SERVER.SessionID == serverObjectState.id) {
            this.cameras.main.startFollow(serverObjectSprite);
        }
    }

    private onRemoveHandler = (serverObjectState: IServerObjectState) => {

        const serverObjectSprite = this.serverObjects.getChildren().find(serverObject => serverObject.getData("id") == serverObjectState.id);

        this.serverObjects.killAndHide(serverObjectSprite);
        serverObjectSprite.destroy();
    }

    update() {

        this.backgrounds.forEach(bg => {
            bg.sprite.tilePositionX = this.cameras.main.scrollX * bg.ratioX + (bg.scroll += 1 * bg.ratioX);
            bg.sprite.tilePositionY = this.cameras.main.scrollY * bg.ratioY;

            //reset scroll when greater than width
            if(bg.scroll >= bg.sprite.width) {
                bg.scroll = 0;
            }
        });

        //rotate body part particles
        this.bodyPartsEmitter.forEachAlive((particle) => {
            particle.rotation = this.particleAngule;
        }, this);
        this.particleAngule+=0.025;
    }

    private createMap(scene: GameScene) {
        const { width, height } = scene.scale;
    
        //create map
        scene.map = scene.make.tilemap({ key: 'demo'});
        const blockTileset = scene.map.addTilesetImage("background_tiles", "background_tiles", 32, 32, 1, 2);
        const skyTileset = scene.map.addTilesetImage("sky_tiles", "sky_tiles", 32, 32, 1, 1);
        const platformTileset = scene.map.addTilesetImage("platform_tiles", "platform_tiles", 32, 32, 1, 2);
        const spikesTileset = scene.map.addTilesetImage("spikes_tiles", "spikes_tiles", 32, 32, 1, 2);
        const itemsTileset = scene.map.addTilesetImage("items_tiles", "items_tiles", 32, 32, 0, 0);

        //add background
        const background = scene.map.createLayer("Background", ["background_tiles", "sky_tiles"]);
    
        //clouds in the back
        scene.backgrounds.push({
            scroll: 0,
            ratioX: 0.05,
            ratioY: 0.05,
            sprite: scene.add.tileSprite(0, 0, width, height, "sky2")
                .setOrigin(0, 0)
                .setScrollFactor(0, 0)
        });
    
        scene.backgrounds.push({
            scroll: 0,
            ratioX: 0.1,
            ratioY: 0.1,
            sprite: scene.add.tileSprite(0, 0, width, height, "sky")
                .setOrigin(0, 0)
                .setScrollFactor(0, 0)
        });
    
        //create ground
        const ground = scene.map.createLayer("Ground", ["background_tiles", "platform_tiles", "spikes_tiles", "items_tiles"]);
        
        scene.animatedTiles.init(scene.map);
        scene.cameras.main.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels);
    
         //if debugging, set collision and draw
         if(scene.physics.config.debug) {
    
            ground.setDepth(1);
            ground.setCollisionByProperty({ 
                collides: true,
            });
    
            this.debugDraw(ground, scene);
        }
    
        scene.serverObjects = scene.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite
        });
    }

    private configureAnimations = (scene: GameScene) => {

    
        scene.burstEmitter = this.add.particles(0, 0, 'effects', {
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            active: true,
            lifespan: 300,
            speed: 500,
            frequency: -1,
            gravityY: 1500
        });

        scene.burstEmitter.stop();
        scene.burstEmitter.setVisible(false);

        scene.flashEmitter = this.add.particles(0, 0, 'flash', {
            speed: { min: -500, max: 500 },
            angle: { min: 0, max: 360 },
            scale: { start: 3, end: 1 },
            blendMode: 'MULTI',
            active: true,
            lifespan: 100,
            frequency: -1
        });
        scene.flashEmitter.stop();
        scene.flashEmitter.setVisible(false);

        scene.bodyPartsEmitter = scene.add.particles(0, 0, 'effects', {
            frame: { 
                frames: [
                    'death/death-1.png',
                    'death/death-2.png', 
                    'death/death-3.png', 
                    'death/death-4.png', 
                    'death/death-5.png', 
                    'death/death-6.png',
                    'death/death-7.png',
                    'death/death-8.png',
                    'death/death-9.png',
                    'death/death-10.png'
                ], cycle: true 
            },
            speed: { min: 100, max: 300 },
            lifespan: { min: 200, max: 700 },
            blendMode: 'NORMAL',
            gravityY: 1000
        });
        
        scene.bodyPartsEmitter.stop();
        scene.bodyPartsEmitter.setVisible(false);
    
        createBatAnims(scene.anims);
        createBunnyAnims(scene.anims);
        createEffectsAnims(scene.anims);
    }

    private debugDraw = (layer: Phaser.Tilemaps.TilemapLayer, scene: Phaser.Scene) => {
    
        console.warn("debug mode is enabled");
        const debugGraphics = scene.add.graphics().setAlpha(0.7);
        
        layer.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243, 243, 48, 255),
            faceColor: new Phaser.Display.Color(40, 39, 37, 255)
        });
    }

    private tweenToThen(sprite: Phaser.Physics.Arcade.Sprite, x: number, y: number, cb: () => void) {

        this.tweens.killTweensOf(sprite);
        this.tweens.add({
            targets: sprite,
            x: x,
            y: y,
            duration: 50,
            ease: 'linear',
            onStart: () => {
                sprite.setData("no_interupt", true);
            },
            onComplete: () => {
                sprite.setData("no_interupt", false);
                cb();
            }
        });
    }

    configureResize(scene: Scene) {

        const resize = () => {
            scene.setScreenSize(Math.min(this.DEFAULT_WIDTH, window.screen.width), Math.min(this.DEFAULT_HEIGHT, window.screen.height));
        }
    
        window.addEventListener('resize', resize);
        console.log(window.screen.width, this.scale.width)

        //if the screen size is different than the scale size, resize
        if(window.screen.width != this.scale.width || window.screen.height != this.scale.height) {
            resize();
        }
    }

}