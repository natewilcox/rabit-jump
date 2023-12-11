import { ServerObjectState } from "../rooms/schema/ServerObjectState";
import { StateMachine } from "@natewilcox/nathan-core";

export class GameObject extends Phaser.Physics.Arcade.Sprite {

    stateMachine: StateMachine = new StateMachine(this, 'fsm');
    serverState: ServerObjectState;
    spawnX: number;
    spawnY: number;
    
    constructor(scene: Phaser.Scene, x: number, y: number, state: ServerObjectState) {
        super(scene, x, y, '')

        this.spawnX = x;
        this.spawnY = y;
        this.serverState = state;
    }
}