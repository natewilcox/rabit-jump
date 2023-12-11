import { ServerObjectState } from "../rooms/schema/ServerObjectState";
import { GameObject } from "./GameObject";

export class Bat extends GameObject {


    get isAlive() {
        return !this.stateMachine.isCurrentState('dead');
    }

    constructor(scene: Phaser.Scene, x: number, y: number, state: ServerObjectState) {
        super(scene, x, y, state);

        this.stateMachine
            .addState("sitting", {
                onEnter: this.onSittingEnter
            })
            .addState("flying", {
                onEnter: this.onFlyingEnter
            })
            .addState("dead", {
                onEnter: this.onDeadEnter
            });

        this.stateMachine.setState('sitting');
    }

    sit() {

        if(!this.isAlive || this.stateMachine.isCurrentState('sitting')) {
            return;
        }

        this.stateMachine.setState('sitting');
    }

    fly() {

        if(!this.isAlive) {
            return;
        }
     
        this.stateMachine.setState('flying');
    }

    die() {

        if(!this.isAlive) {
            return;
        }
    
        this.stateMachine.setState('dead');
    }

    reset() {
        this.setPosition(this.spawnX, this.spawnY);
        this.stateMachine.setState('sitting');
    }

    private onSittingEnter() {
        console.log(`${this.serverState.id} is sitting`);
    }

    private onFlyingEnter() {
        console.log(`${this.serverState.id} has flying`);
    }

    private onDeadEnter = () => {
        console.log(`${this.serverState.id} just died`);
        this.setVelocity(0, 0);
    }
}