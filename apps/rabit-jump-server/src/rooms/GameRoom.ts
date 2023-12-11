import { Room, Client } from "@colyseus/core";
import { GameRoomState } from "./schema/GameRoomState";
import { Dispatcher } from "@colyseus/command";
import { SimulationEventEmitter, SimulationEvents, SimulationScene } from "../scenes/SimulationScene";
import { JoinCommand } from "../commands/JoinCommand";
import { LeaveCommand } from "../commands/LeaveCommand";
import { ClientService } from "@natewilcox/colyseus-nathan";
import { ClientMessages } from "@natewilcox/rabit-jump-shared";

export class GameRoom extends Room<GameRoomState> {
  
    CLIENT: ClientService<ClientMessages>;
    game: Phaser.Game;
    maxClients = 4;
    dispatcher: Dispatcher<GameRoom> = new Dispatcher(this);

    default_x: number;
    default_y: number;

    onCreate (options: any) {
        console.info("Room created");
  
        const PATCH = 20;
        const FPS = 30;

        (global as any).phaserOnNodeFPS = FPS;

        this.setPatchRate(1000/PATCH);
        this.setState(new GameRoomState());
        this.CLIENT = new ClientService(this);

        const config = {
            type: Phaser.HEADLESS,
            width: 800,
            height: 600,
            fps: {
                target: FPS,
                forceSetTimeOut: true
            },
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 1000, x: 0 }
                }
            }
        }

        console.log("Starting simluation scene");

        this.game = new Phaser.Game(config);
        this.game.scene.add('SimulationScene', SimulationScene, true, { room: this, CLIENT: this.CLIENT });   

        SimulationEventEmitter.on(SimulationEvents.OnSpawnCreated, (data: any) => {
            this.default_x = data.x;
            this.default_y = data.y;
        });
    }

    onJoin (client: Client, options: any) {
        console.log(client.sessionId, "joined!");
        this.dispatcher.dispatch(new JoinCommand(), {
            client,
            x: this.default_x,
            y: this.default_y
        });
    }

    onLeave (client: Client, consented: boolean) {
        console.log(client.sessionId, "left!");
        this.dispatcher.dispatch(new LeaveCommand(), {
            client
        });
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
        
        SimulationEventEmitter.removeAllListeners();
        this.game.destroy(false);
    }
}
