import { ArraySchema, Schema } from "@colyseus/schema";
import { IServerObjectState } from "./IServerObjectState";

export interface IRoomState extends Schema {

    serverObjects: ArraySchema<IServerObjectState>;
}
