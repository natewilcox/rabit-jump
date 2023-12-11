import Phaser from "phaser";
import { BootStrap } from "./scenes/BootStrap";
import { GameScene } from "./scenes/GameScene";
import { HUD } from "./scenes/HUD";

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
    scene: [BootStrap, GameScene, HUD]
};

const game = new Phaser.Game(config);