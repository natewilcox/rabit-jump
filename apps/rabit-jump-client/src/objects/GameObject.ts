import { IServerObjectState } from "@natewilcox/rabit-jump-shared";

export class GameObject extends Phaser.Physics.Arcade.Sprite {

    serverState: IServerObjectState;
    spawnX: number;
    spawnY: number;
    
    constructor(scene: Phaser.Scene, x: number, y: number, state: IServerObjectState) {
        super(scene, x, y, '')

        this.spawnX = x;
        this.spawnY = y;
        this.serverState = state;
    }
}