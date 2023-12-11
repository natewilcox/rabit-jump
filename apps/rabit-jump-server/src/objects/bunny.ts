import { Client } from "colyseus";
import { ServerObjectState } from "../rooms/schema/ServerObjectState";
import { SimulationEventEmitter, SimulationEvents } from "../scenes/SimulationScene";
import { PlayerGameObject } from "./PlayerGameObject";

export class Bunny extends PlayerGameObject {

    private MAX_JUMPS = 3;
    private MAX_X_JUMP_VELOCITY = 150;
    private JUMP_VELOCITY = 200;
    private allowedJumpCount = 2;

    get isAlive() {
        return !this.stateMachine.isCurrentState('dead') && !this.stateMachine.isCurrentState('ghost');
    }

    constructor(scene: Phaser.Scene, x: number, y: number, state: ServerObjectState, client: Client) {
        super(scene, x, y, state, client)

        this.stateMachine
            .addState("idle", {
                onEnter: this.onIdleEnter
            })
            .addState("jump", {
                onEnter: this.onJumpEnter
            })
            .addState("dead", {
                onEnter: this.onDeadEnter
            })
            .addState("ghost", {
                onEnter: this.onGhostEnter,
                onUpdate: this.onGhostUpdate
            });

        this.stateMachine.setState('idle');
    }

    idle() {

        if(!this.isAlive || this.stateMachine.isCurrentState('idle')) {
            return;
        }

        this.stateMachine.setState('idle');
    }

    jump(x: number, y: number) {

        if(!this.isAlive || this.allowedJumpCount < 0) {
            return;
        }
     
        this.stateMachine.setState('jump', { x, y });
    }

    die() {

        if(!this.isAlive) {
            return;
        }
    
        this.stateMachine.setState('dead');
    }

    ghost() {

        if(this.isAlive) {
            return;
        }

        this.stateMachine.setState('ghost');
    }

    reset() {
        this.setPosition(this.spawnX, this.spawnY);
        this.body.checkCollision.none = false;
        this.stateMachine.setState('idle');
    }

    private onIdleEnter() {
        console.log(`${this.serverState.id} is idle`);
        this.allowedJumpCount = this.MAX_JUMPS;
    }

    private onJumpEnter(config: any) {
        console.log(`${this.serverState.id} has jumped`);

        //if the swipe isnt big enough, ignore it
        if(Math.abs(config.x) <= 100) {
            config.x = 0;
        }

        const jv = (this.JUMP_VELOCITY * (this.allowedJumpCount / this.MAX_JUMPS)) + 200;
        const dir = new Phaser.Math.Vector2(config.x, config.y);
        dir.normalize();

        const dx = (dir.x * 60) + this.body.velocity.x;
        this.setVelocityX(dx <= this.MAX_X_JUMP_VELOCITY ? dx : this.MAX_X_JUMP_VELOCITY);
        this.setVelocityY(-jv);

        this.allowedJumpCount--;
    }

    private onDeadEnter = () => {
        console.log(`${this.serverState.id} just died`);
        this.setVelocity(0, 0);

        //trigger simulation event to turn rabit into ghost
        this.scene.time.delayedCall(2000, () => {
            SimulationEventEmitter.emit(SimulationEvents.OnGhost, this);
        });
    }

    private onGhostEnter = () => {
        console.log(`${this.serverState.id} is now a ghost`);
   
        //ghosts dont need collision
        this.body.checkCollision.none = true;
    }

    private onGhostUpdate = () => {

        const spawnPoint = new Phaser.Math.Vector2(this.spawnX, this.spawnY); 
        const distance = Phaser.Math.Distance.Between(this.x, this.y, spawnPoint.x, spawnPoint.y);
        const angle = Phaser.Math.Angle.Between(this.x, this.y, spawnPoint.x, spawnPoint.y);
    
        if (distance > 10) {
            const velocityX = Math.cos(angle) * 200;
            const velocityY = Math.sin(angle) * 200;
            
            this.setVelocity(velocityX, velocityY);
        } else {
            this.setVelocity(0, 0);
            SimulationEventEmitter.emit(SimulationEvents.OnReset, this);
        }
    }
}