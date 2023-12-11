import { Client } from "colyseus";
import { GameObject } from "./GameObject";
import { IServerObjectState } from "@natewilcox/rabit-jump-shared";

export class PlayerGameObject extends GameObject {

    client: Client;

    constructor(scene: Phaser.Scene, x: number, y: number, state: IServerObjectState, client: Client) {
        super(scene, x, y, state)
        this.client = client;
    }
}