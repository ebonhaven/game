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
      { font: '24px Arial Black', fill: '#FFF' });
    
    this.newCharacterButton.setInteractive();
    this.newCharacterButton.once('pointerdown', () => {
      this.goToNewCharacter();
    }, this);

    var backText: string = "Back";
    this.backButton = this.add.text(50, 500, backText,
      { font: '24px Arial Black', fill: '#FFF' });
    
    this.backButton.setInteractive();
    this.backButton.once('pointerdown', () => {
      this.goBack();
    }, this);

    console.log(this.scatter);

    this.scatter.getCharacters(this.registry.values.account.name);

    this.scatter.events.once("accountrefreshed", (result) => {
      console.log('Account refreshed!');
      console.log(result);
    }, this);

    this.scatter.events.once("characterdeleted", (result) => {
      console.log("Character deleted!");
      this.ui.clearCharacterList();
      this.scatter.getCharacters(this.registry.values.account.name);
    });

    this.scatter.events.once("charactersrefreshed", (result) => {
      console.log('Characters updated!');
      this.ui.addRowToCharacterList(this, result.rows);
      // let yPosStart = 100;
      // result.rows.forEach((row, index) => {
      //   let btn = this.add.text(50, yPosStart, row.character_name, 
      //     { font: '24px Arial Black', fill: '#FFF' });
      //   let txt = `Level ${row.level} ${this.races[row.race]} ${this.professions[row.profession]}`;
      //   let yPos = yPosStart + 26;
      //   this.add.text(50, yPos, txt, { font: '14px Arial', fill: '#DEDEDE'});
      //   btn.setInteractive();
      //   btn.on('pointerdown', () => {
      //     this.startGame();
      //     console.log('clicked: ' + index);
      //   }, this);
      //   yPos = yPos + 16;
      //   let delBtn = this.add.text(50, yPos, 'Delete', { font: '16px Arial', fill: '#FFF'});
      //   delBtn.setInteractive();
      //   delBtn.on('pointerdown', () => {
      //     this.deleteCharacter(row.character_id);
      //   }, this);
      // });
      // console.log(result);
    }, this);
  }

  characterSelected() {
    this.scene.start("FieldScene");
  }

  goToNewCharacter() {
    this.scene.start("NewCharacterScene");
  }

  goBack() {
    this.scene.start("LoginScene");
  }


};
