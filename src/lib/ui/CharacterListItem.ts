export class CharacterListItem {
  nameLabel;
  descriptionText;
  selectHandle;
  deleteBtn;

  clear() {
    this.descriptionText.destroy();
    this.selectHandle.destroy();
    this.deleteBtn.destroy();
  }

}