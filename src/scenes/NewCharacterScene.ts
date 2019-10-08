import "phaser";
import { Scatter } from '../lib/Scatter';

export class NewCharacterScene extends Phaser.Scene {
  scatter;
  characters;

  constructor() {
    super({
      key: "NewCharacterScene"
    });
  }

  preload(): void {
    this.load.html('newcharacter', "assets/forms/newcharacter.html")
  }

  create(): void {
    this.scatter = Scatter.getInstance();
    let element = this.add.dom(400, 200).createFromCache("newcharacter");
    element.addListener('click');
    element.on('click', (evt) => {
      let account = this.registry.get("account");
      if (evt.target.name == "submit") {
        let data = {
          user: account.name,
          character_name: element.getChildByName("character-name")["value"],
          gender: element.getChildByName("gender")["value"],
          race: element.getChildByName("race")["value"],
          profession: element.getChildByName("profession")["value"]
        }
        this.scatter.newCharacter( account, data );
      }
      console.log(evt);
    }, this);
    this.scatter.events.on("charactercreated", () => {
      this.refreshCharacters();
      console.log('Character Created!');
      this.goToCharacterSelect();
    });
  }

  private refreshCharacters() {
    let account = this.registry.get("account");
    //let characters = this.scatter.getCharacters( account.name );
  }

  private goToCharacterSelect() {
    this.scene.start("CharacterSelectScene");
  }
  
};
