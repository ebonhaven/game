import "phaser";
import { ScatterProvider } from '../lib/providers/ScatterProvider';

export class NewCharacterScene extends Phaser.Scene {
  provider;
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
    this.provider = this.registry.get('provider');
    let element = this.add.dom(400, 200).createFromCache("newcharacter");
    element.addListener('click');
    element.on('click', (evt) => {
      let account = this.registry.get("account");
      if (evt.target.name == "submit") {
        let gender = Array.prototype.slice.call(document.getElementsByName("gender")).filter((e) => e.checked)[0];
        let data = {
          user: account.name,
          character_name: element.getChildByName("character-name")["value"],
          gender: gender.value,
          race: element.getChildByName("race")["value"],
          profession: element.getChildByName("profession")["value"]
        }
        console.log(account);
        console.log(data);
        this.provider.newCharacter( account, data );
      }
      console.log(evt);
    }, this);
    this.provider.events.on("charactercreated", () => {
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
