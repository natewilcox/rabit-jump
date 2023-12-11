import { Schema } from "@colyseus/schema";

export interface IServerObjectQueuedEvent extends Schema {

  x: number;
  y: number;
  e: number
}

export interface IServerObjectState extends Schema {
  
  id: string;
  x: number;
  y: number;
  objectType: number;
}