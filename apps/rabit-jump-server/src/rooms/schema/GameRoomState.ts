import { ArraySchema, Schema, type } from "@colyseus/schema";
import { ServerObjectState } from "./ServerObjectState";
import { IRoomState } from "@natewilcox/rabit-jump-shared";

export class GameRoomState extends Schema implements IRoomState {

    @type([ServerObjectState])
    serverObjects = new ArraySchema<ServerObjectState>();
}
