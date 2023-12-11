import { Schema, type } from "@colyseus/schema";
import { IPosition } from "@natewilcox/rabit-jump-shared";

export class Position extends Schema implements IPosition {
  
  @type('number')
  x: number;

  @type('number')
  y: number;

  constructor(x: number, y: number) {
    super();
    
    this.x = x;
    this.y = y;
  }
}