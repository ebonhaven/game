import "phaser";
import { LoginScene } from "./scenes/LoginScene";
import { CharacterSelectScene } from "./scenes/CharacterSelectScene";
import { NewCharacterScene } from "./scenes/NewCharacterScene";
import { FieldScene } from "./scenes/FieldScene";
import { GameScene } from "./scenes/GameScene";
import { ScoreScene } from "./scenes/ScoreScene";
import { PrivKeyScene } from './scenes/PrivKeyScene';

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;

const config: GameConfig = {
  title: "Ebonhaven",
  width: DEFAULT_WIDTH,
  height: DEFAULT_HEIGHT,
  parent: "game",
  scene: [ LoginScene, CharacterSelectScene, NewCharacterScene, FieldScene, GameScene, ScoreScene, PrivKeyScene ],
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

window.addEventListener('load', () => {
  let game = new Phaser.Game(config);
});
