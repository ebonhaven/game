import "phaser";
import { WelcomeScene } from "./scenes/WelcomeScene";
import { FieldScene } from "./scenes/FieldScene";
import { GameScene } from "./scenes/GameScene";
import { ScoreScene } from "./scenes/ScoreScene";

const config: GameConfig = {
  title: "Ebonhaven",
  width: 800,
  height: 600,
  parent: "game",
  scene: [ WelcomeScene, FieldScene, GameScene, ScoreScene ],
  physics: {
    default: "arcade",
    arcade: {
      debug: true
    }
  },
  backgroundColor: "#000"
};

export class StarfallGame extends Phaser.Game {
  constructor(config: GameConfig) {
    super(config);
  }
};

window.onload = () => {
  var game = new StarfallGame(config);
};
