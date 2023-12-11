import { Command } from "@colyseus/command";
import { GameRoom } from "../rooms/GameRoom";
import { SimulationEventEmitter, SimulationEvents } from "../scenes/SimulationScene";

type Payload = {
    client: any
};

export class LeaveCommand extends Command<GameRoom, Payload> {

    async execute({ client }: Payload) {

        console.log("LeaveCommand executed");
        const index = this.state.serverObjects.findIndex(serverObject => serverObject.id == client.id);
        const state = this.state.serverObjects.find(serverObject => serverObject.id == client.id);
        this.state.serverObjects.splice(index, 1);

        SimulationEventEmitter.emit(SimulationEvents.OnLeave, client);
    }
}