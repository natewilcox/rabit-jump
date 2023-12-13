import Phaser from "phaser";
import * as data from "./version.json";
import { BootStrap } from "./scenes/BootStrap";
import { GameScene } from "./scenes/GameScene";
import { HUD } from "./scenes/HUD";
import { addBuildInfo } from "@natewilcox/version-meta";

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scale: {
        mode: Phaser.Scale.NONE
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 },
        }
    },
    scene: [BootStrap]
};

const game = new Phaser.Game(config);
game.scene.add('game', GameScene);
game.scene.add('HUD', HUD);


// adds build info to the window object
addBuildInfo(data);