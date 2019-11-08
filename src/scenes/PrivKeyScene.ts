import { UIManager } from './../lib/UIManager';
import { DefaultProvider } from './../lib/providers/DefaultProvider';

import "phaser";
import { config as ENV } from "../config/config";
import { PROVIDERS, Provider } from '../lib/providers/Provider';

export class PrivKeyScene extends Phaser.Scene {

  provider;
  ui;

  constructor() {
    super({
      key: "PrivKeyScene"
    });
  }

  preload(): void {
    this.load.html('privkey', "assets/forms/privkey.html")
  }

  create(): void {
    this.ui = new UIManager();
    this.provider = new DefaultProvider();
    let element = this.add.dom(400, 200).createFromCache("privkey");
    element.getChildByName("priv-key").value = ENV.privKey;
    element.addListener('click');
    element.on('click', (evt) => {
      if (evt.target.name == "submit") {
        this.submit(element.getChildByName("priv-key")["value"]);
      }
      if (evt.target.name == "cancel") {
        console.log("Cancelled");
        this.cancel();
      }
    });

    this.provider.events.once('accountsrefreshed', (result) => {
      console.log('accountsrefreshed');
      this.refreshUI(result);
    });
  }

  async refreshUI(data) {
    this.ui.renderAccountsList(this, data);
  }

  accountSelected(name: string) {
    let account = {
      name: name,
      auth: {
        name: name,
        authority: 'active'
      }
    };
    this.registry.set('account', account);
    this.scene.start("CharacterSelectScene");
  }

  submit(privKey: string): void {
    this.provider.setProvider(PROVIDERS.DEFAULT);
    this.provider.setPrivateKey(privKey);
    this.registry.set('provider', this.provider);
  }

  cancel(): void {
    this.scene.start("LoginScene");
  }
}