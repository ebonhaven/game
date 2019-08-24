import "phaser";
import { LoginScene } from "./scenes/LoginScene";
import { CharacterSelectScene } from "./scenes/CharacterSelectScene";
import { NewCharacterScene } from "./scenes/NewCharacterScene";
import { FieldScene } from "./scenes/FieldScene";
import { GameScene } from "./scenes/GameScene";
import { ScoreScene } from "./scenes/ScoreScene";

const config: GameConfig = {
  title: "Ebonhaven",
  width: 800,
  height: 600,
  parent: "game",
  scene: [ LoginScene, CharacterSelectScene, NewCharacterScene, FieldScene, GameScene, ScoreScene ],
  render: {
    pixelArt: true
  },
  dom: {
    createContainer: true
  },
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
