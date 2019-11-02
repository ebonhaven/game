import "phaser";
import { Scatter } from '../lib/Scatter';
import { UIManager } from '../lib/UIManager';

export class CharacterSelectScene extends Phaser.Scene {
  ui;
  scatter;
  backButton;
  newCharacterButton;
  characters = [];

  

  constructor() {
    super({
      key: "CharacterSelectScene"
    });
  }

  create(): void {
    this.ui = new UIManager();
    this.scatter = Scatter.getInstance();

    var newCharacterText: string = "New Character";
    this.newCharacterButton = this.add.text(50, 250, newCharacterText,
      { fontFamily: '"Press Start 2P"', fontSize: '24px', fill: '#FFF' });
    
    this.newCharacterButton.once('pointerdown', () => {
      this.goToNewCharacter();
    }, this);

    var backText: string = "Back";
    this.backButton = this.add.text(50, 500, backText,
      { fontFamily: '"Press Start 2P"', fontSize: '24px', fill: '#FFF' });
    
    this.backButton.setInteractive();
    this.backButton.once('pointerdown', () => {
      this.goBack();
    }, this);

    console.log(this.scatter);

    this.refreshUI();

    this.scatter.events.once("characterdeleted", (result) => {
      console.log("Character deleted!");
      this.refreshUI();
    });
  }

  async refreshUI() {
    this.ui.clearCharacterList();
    const accounts = await this.scatter.getAccount(this.registry.values.account.name);
    const characters = await this.scatter.getCharacters(this.registry.values.account.name);
    this.registry.set('characters', characters.rows);
    console.log(accounts);
    this.ui.renderCharacterList(this, characters.rows);
    if (accounts.rows.length > 0 && accounts.rows[0].max_characters == this.ui.characterList.length) {
      console.log(this.newCharacterButton);
      this.newCharacterButton.disableInteractive();
      this.newCharacterButton.setFill('#d3d3d3');
    } else {
      this.newCharacterButton.setInteractive();
      this.newCharacterButton.setFill('#FFF');
    }
  }

  characterSelected(characterIndex) {
    this.registry.set('activeCharacterIndex', characterIndex);
    this.scene.start("FieldScene");
  }

  goToNewCharacter() {
    this.scene.start("NewCharacterScene");
  }

  goBack() {
    this.scene.start("LoginScene");
  }


};
