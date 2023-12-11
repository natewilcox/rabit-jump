import { Command } from "@colyseus/command";
import { GameRoom } from "../rooms/GameRoom";
import { ServerObjectState } from "../rooms/schema/ServerObjectState";
import { SimulationEventEmitter, SimulationEvents } from "../scenes/SimulationScene";

type Payload = {
    x: number,
    y: number,
    objectType: string
};

let ID_SEED = 0;

export class CreateObjectCommand extends Command<GameRoom, Payload> {

    async execute({ x, y, objectType }: Payload) {
        
        console.log("CreateObjectCommand executed");
        const objectState = new ServerObjectState((++ID_SEED).toString(), x, y, parseInt(objectType));
        this.room.state.serverObjects.push(objectState);

        SimulationEventEmitter.emit(SimulationEvents.OnCreateObject, objectState);
    }
}