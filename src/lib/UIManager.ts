import { CharacterListItem } from './ui/CharacterListItem';

export class UIManager {
  scene;
  characterList = [];
  professions = {
    1: 'Rockhound',
    2: 'Survivalist',
    3: 'Alchemist',
    4: 'Conjuror',
    5: 'Metalsmith'
  };

  races = {
    1: 'Human',
    2: 'Earthen',
    3: 'Amazon',
    4: 'Highborne',
    5: 'Goblin',
    6: 'Mecha'
  };

  addRowToCharacterList(scene, data) {
    let yPosStart = 100;
    data.forEach((row, index) => {
      let item = new CharacterListItem();
      item.selectHandle = scene.add.text(50, yPosStart, row.character_name, 
        { font: '24px Arial Black', fill: '#FFF' });
      let txt = `Level ${row.level} ${this.races[row.race]} ${this.professions[row.profession]}`;
      let yPos = yPosStart + 26;
      item.descriptionText = scene.add.text(50, yPos, txt, { font: '14px Arial', fill: '#DEDEDE'});
      item.selectHandle.setInteractive();
      item.selectHandle.on('pointerdown', () => {
        console.log('clicked: ' + index);
        this.startGame(scene);
      }, this);
      yPos = yPos + 16;
      item.deleteBtn = scene.add.text(50, yPos, 'Delete', { font: '16px Arial', fill: '#FFF'});
      item.deleteBtn.setInteractive();
      item.deleteBtn.on('pointerdown', () => {
        this.deleteCharacter(scene, row.character_id);
      }, this);
      this.characterList.push(item);
    });
  }

  clearCharacterList() {
    this.characterList.forEach(i => { i.clear() });
  }

  startGame(scene) {
    scene.characterSelected();
  }

  deleteCharacter(scene, characterId) {
    console.log(characterId);
    let account = scene.registry.get("account");
    let data = {
      user: account.name,
      character_id: characterId
    };
    scene.scatter.delCharacter( account, data );
  }

}