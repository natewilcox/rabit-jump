import { Command } from "@colyseus/command";
import { GameRoom } from "../rooms/GameRoom";
import { Bunny } from "../objects/bunny";
import { Client } from "colyseus";
import { ServerMessages } from "@natewilcox/rabit-jump-shared";

type Payload = {
    client: Client,
    bunny: Bunny,
    data: any
};

export class JumpCommand extends Command<GameRoom, Payload> {

    async execute({ client, bunny, data }: Payload) {

        console.log("JumpCommand executed");
        this.room.CLIENT.send(ServerMessages.BunnyJumped, bunny.serverState);
        bunny.jump(data.x, data.y);
    }
}