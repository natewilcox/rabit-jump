import { Command } from "@colyseus/command";
import { GameRoom } from "../rooms/GameRoom";
import { Bunny } from "../objects/bunny";
import { ServerMessages } from "@natewilcox/rabit-jump-shared";

type Payload = {
    bunny: Bunny
};

export class GhostCommand extends Command<GameRoom, Payload> {

    async execute({ bunny }: Payload) {

        console.log("GhostCommand executed");
        this.room.CLIENT.send(ServerMessages.BunnyGhost, bunny.serverState);
        bunny.ghost();
    }
}