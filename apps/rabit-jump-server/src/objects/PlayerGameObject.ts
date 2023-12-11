import { Client } from "colyseus";
import { ServerObjectState } from "../rooms/schema/ServerObjectState";
import { GameObject } from "./GameObject";

export class PlayerGameObject extends GameObject {

    client: Client;

    constructor(scene: Phaser.Scene, x: number, y: number, state: ServerObjectState, client: Client) {
        super(scene, x, y, state)
        this.client = client;
    }
}