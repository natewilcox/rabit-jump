import { Schema } from "@colyseus/schema";

export interface IPosition extends Schema {
  
  x: number;
  y: number;
}