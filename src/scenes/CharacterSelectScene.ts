import "phaser";
import { Scatter } from '../lib/Scatter';

export class CharacterSelectScene extends Phaser.Scene {
  scatter;
  backButton;
  newCharacterButton;

  constructor() {
    super({
      key: "CharacterSelectScene"
    });
    this.scatter = new Scatter();
  }

  create(): void {
    var newCharacterText: string = "New Character";
    this.newCharacterButton = this.add.text(50, 250, newCharacterText,
      { font: '24px Arial Bold', fill: '#FFF' });
    
    this.newCharacterButton.setInteractive();
    this.newCharacterButton.on('pointerdown', () => {
      this.goToNewCharacter();
    });

    var backText: string = "Back";
    this.backButton = this.add.text(50, 500, backText,
      { font: '24px Arial Bold', fill: '#FFF' });
    
    this.backButton.setInteractive();
    this.backButton.on('pointerdown', () => {
      this.goBack();
    });

    this.scatter.getCharacters(this.registry.values.account.name).then((result) => {
      this.registry.set("characters", result);
    });
  }

  characterSelected() {
    this.scene.start("FieldScene");
  }

  goToNewCharacter() {
    this.scene.start("NewCharacterScene");
  }

  goBack() {
    this.scene.switch("LoginScene");
  }


};
