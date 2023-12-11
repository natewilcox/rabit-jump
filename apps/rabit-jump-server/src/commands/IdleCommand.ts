import { Command } from "@colyseus/command";
import { GameRoom } from "../rooms/GameRoom";
import { Bunny } from "../objects/bunny";
import { ServerMessages } from "@natewilcox/rabit-jump-shared";

type Payload = {
    bunny: Bunny
};

export class IdleCommand extends Command<GameRoom, Payload> {

    async execute({ bunny }: Payload) {
        
        console.log("IdleCommand executed");
        this.room.CLIENT.send(ServerMessages.BunnyIdle, bunny.serverState);
        bunny.idle();
    }
}