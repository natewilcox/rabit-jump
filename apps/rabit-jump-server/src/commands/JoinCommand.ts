import { Command } from "@colyseus/command";
import { GameRoom } from "../rooms/GameRoom";
import { ServerObjectState } from "../rooms/schema/ServerObjectState";
import { SimulationEventEmitter, SimulationEvents } from "../scenes/SimulationScene";
import { ObjectType } from "@natewilcox/rabit-jump-shared";

type Payload = {
    client: any,
    x: number,
    y: number
};

export class JoinCommand extends Command<GameRoom, Payload> {

    async execute({ client, x, y }: Payload) {

        console.log("JoinCommand executed");
        const playerObject = new ServerObjectState(client.id, x, y, ObjectType.Bunny);
        this.room.state.serverObjects.push(playerObject);

        //TEMP FIX. sometimes join event doesnt throw
        this.clock.setTimeout(() => {
            console.warn("Using temp fix in join command");
            SimulationEventEmitter.emit(SimulationEvents.OnJoined, playerObject);
        }, 0);
    }
}