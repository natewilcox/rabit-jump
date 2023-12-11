import '@geckos.io/phaser-on-nodejs';
import Phaser from "phaser";
import { GameRoom } from '../rooms/GameRoom';
import { ServerObjectState } from '../rooms/schema/ServerObjectState';
import { Bunny } from '../objects/bunny';
import { JumpCommand } from '../commands/JumpCommand';
import { ResetCommand } from '../commands/ResetCommand';
import { Client } from 'colyseus';
import { IdleCommand } from '../commands/IdleCommand';
import { DieCommand } from '../commands/DieCommand';
import { GhostCommand } from '../commands/GhostCommand';
import { CreateObjectCommand } from '../commands/CreateObjectCommand';
import { Bat } from '../objects/bat';
import { GameObject } from '../objects/GameObject';
import { ClientService } from '@natewilcox/colyseus-nathan';
import { ClientMessages, ObjectType, ServerMessages } from '@natewilcox/rabit-jump-shared';

enum Direction {
    North = 1,
    East = 2,
    South = 3,
    West = 4
}
export enum SimulationEvents {
    OnJoined = 'onjoined',
    OnLeave = 'onleave',
    OnIdle = 'onidle',
    OnDie = 'ondie',
    OnGhost = 'onghost',
    OnReset = 'onreset',
    OnCreateObject = 'oncreateobject',
    OnObjectCreated = 'onobjectcreated',
    OnSpawnCreated = 'onspawncreated'
}

export const SimulationEventEmitter = new Phaser.Events.EventEmitter();

export class SimulationScene extends Phaser.Scene {

    playerObjects: Phaser.Physics.Arcade.Group;
    serverObjects: Phaser.Physics.Arcade.Group;

    private room: GameRoom;
    private CLIENT: ClientService<ServerMessages>;

    constructor() {
        super("SimulationScene");
    }

    preload() {

        this.load.tilemapTiledJSON("map", __dirname + "../../../public/maps/demo.json");

        this.playerObjects = this.physics.add.group({
            classType: Bunny
        });

        this.serverObjects = this.physics.add.group({
            classType: GameObject
        });
    }

    create(config: { room: GameRoom, CLIENT: ClientService<ServerMessages> }) {
        console.log("simulation started");
        
        this.room = config.room;
        this.CLIENT = config.CLIENT;
        
        //create map for simulation
        const map = this.make.tilemap({ key: 'map'});
        const ground = map.createLayer("Ground", []);
        const background = map.createLayer("Background", []);
        
        //physics settings
        ground.setCollisionByProperty({ collides: true });
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.physics.world.setBoundsCollision(true, true, true, true);
        this.physics.add.overlap(this.playerObjects, this.serverObjects);
        this.physics.add.collider(this.playerObjects, ground, this.handleGroundCollision);
        this.physics.add.collider(this.serverObjects, ground);

        //simulation events
        SimulationEventEmitter.on(SimulationEvents.OnJoined, this.createPlayerObject);
        SimulationEventEmitter.on(SimulationEvents.OnLeave, this.destroyPlayerObject);
        SimulationEventEmitter.on(SimulationEvents.OnIdle, this.playerIdle);
        SimulationEventEmitter.on(SimulationEvents.OnDie, this.playerDied);
        SimulationEventEmitter.on(SimulationEvents.OnGhost, this.playerGhost);
        SimulationEventEmitter.on(SimulationEvents.OnReset, this.playerReset);
        SimulationEventEmitter.on(SimulationEvents.OnCreateObject, this.createServerObject);

        //incoming events from client
        this.CLIENT.on(ClientMessages.JumpCommand, this.playerJumped);
        
        //scene events
        this.events.on(Phaser.Scenes.Events.POST_UPDATE, this.postUpdate);

        //create the map objects
        map.getObjectLayer("Objects").objects.forEach((obj) => {

            if(parseInt(obj.type) == ObjectType.Spawn) {
                SimulationEventEmitter.emit(SimulationEvents.OnSpawnCreated, { x: obj.x, y: obj.y });
            }
            else {
                this.room.dispatcher.dispatch(new CreateObjectCommand(), { x: obj.x,y: obj.y, objectType: obj.type });
            }
        });
    }

    private handleGroundCollision = (obj1: any, obj2: any) => {

        const bunny = obj1 as Bunny;
        const tile = obj2 as Phaser.Tilemaps.Tile;

        //if hitting a death block from the right angle
        if(tile.properties.deathBlock && this.isHittingDeathBlockFromRightSide(bunny, tile.properties.direction)) {
            SimulationEventEmitter.emit(SimulationEvents.OnDie, bunny);
            return;
        }

        //touching the ground
        if(bunny.body.blocked.down) {
            
            SimulationEventEmitter.emit(SimulationEvents.OnIdle, bunny);

            //if you are colliding with a block that moves you, add velocity
            if(tile.properties.move != null) {
                bunny.setVelocityX(tile.properties.move);
            }
        }
    }

    private isHittingDeathBlockFromRightSide = (bunny: Bunny, dir: number) => {

        return bunny.body.blocked.up && dir == Direction.South ||
            bunny.body.blocked.down && dir == Direction.North ||
            bunny.body.blocked.left && dir == Direction.East ||
            bunny.body.blocked.right && dir == Direction.West
    }

    private createPlayerObject = (serverObjectState: ServerObjectState) => {
        
        const client = this.room.clients.find(c => c.id == serverObjectState.id);
        const bunny = new Bunny(this, serverObjectState.x, serverObjectState.y, serverObjectState, client);
        this.playerObjects.add(bunny);

        bunny.setSize(25, 70);
        console.log("player joined, created object");
    }

    private createServerObject = (serverObjectState: ServerObjectState) => {

        switch(serverObjectState.objectType) {
            case ObjectType.Bat : 
                
                console.log("creating new bat")
                const bat = new Bat(this, serverObjectState.x, serverObjectState.y, serverObjectState);
                this.serverObjects.add(bat);

                bat.setSize(10, 10);
                break;
        }
    }

    private destroyPlayerObject = (playerObjectState: ServerObjectState) => {
  
        const playerObject = this.playerObjects.getChildren().find(bunny => (bunny as Bunny).serverState?.id == playerObjectState.id);

        if(playerObject) {

            this.playerObjects.killAndHide(playerObject);
            playerObject.destroy();
        }
    }

    private playerIdle = (bunny: Bunny) => {

        if(!bunny.stateMachine.isCurrentState('idle') && bunny.isAlive) {
            this.room.dispatcher.dispatch(new IdleCommand(), { bunny });
        }
    }

    private playerReset = (bunny: Bunny) => {

        this.room.dispatcher.dispatch(new ResetCommand(), { bunny });
    }

    private playerJumped = (client: Client, data: any) => {
   
        const bunny = this.playerObjects.getChildren().find(bunny => (bunny as Bunny).serverState?.id == client.id) as Bunny;

        if(bunny.isAlive) {
            this.room.dispatcher.dispatch(new JumpCommand(), { client, bunny, data });
        }
    }

    private playerDied = (bunny: Bunny) => {

        if(bunny.isAlive) {
            this.room.dispatcher.dispatch(new DieCommand(), { bunny });
        }
    }

    private playerGhost = (bunny: Bunny) => {

        if(!bunny.isAlive) {
            this.room.dispatcher.dispatch(new GhostCommand(), { bunny });
        }
    }

    update(time: number, delta: number): void {
        
        this.playerObjects.getChildren().forEach((playerObject) => {
      
            const bunny = playerObject as Bunny;
            bunny.stateMachine.update(delta);
        });
    }

    private postUpdate = () => {

        this.playerObjects.getChildren().forEach((playerObject) => {
            
            const bunny = playerObject as Bunny;
            bunny.serverState.x = bunny.x
            bunny.serverState.y = bunny.y;
        });

        this.serverObjects.getChildren().forEach((serverObjects) => {
            
            const obj = serverObjects as GameObject;
            obj.serverState.x = obj.x
            obj.serverState.y = obj.y;
        });
    }
}