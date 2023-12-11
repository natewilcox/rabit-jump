import { Schema, type } from "@colyseus/schema";
import { IServerObjectState, ObjectType } from "@natewilcox/rabit-jump-shared";

export class ServerObjectQueuedEvent extends Schema {

  @type('number')
  x: number;

  @type('number')
  y: number;

  @type('number')
  e: number
}
export class ServerObjectState extends Schema implements IServerObjectState {
  
  @type('string')
  id: string;

  @type('number')
  x: number;

  @type('number')
  y: number;

  @type('number')
  objectType: number;

  constructor(id: string, x: number, y: number, objectType: ObjectType) {
    super();
    
    this.id = id;
    this.x = x;
    this.y = y;
    this.objectType = objectType;
  }
}