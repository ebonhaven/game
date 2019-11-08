import { ScatterProvider } from './../lib/providers/ScatterProvider';
import { PROVIDERS } from './../lib/providers/Provider';
import "phaser";
import { Provider } from '../lib/providers/Provider';

export class LoginScene extends Phaser.Scene {
  title: Phaser.GameObjects.Text;
  scatterBtn: Phaser.GameObjects.Text;
  logoutButton: Phaser.GameObjects.Text;
  privKeyBtn: Phaser.GameObjects.Text;
  provider;

  constructor() {
    super({
      key: "LoginScene"
    });
  }

  create(): void {

    console.log('creating login scene');
    this.title = this.add.text(125, 200, `Ebonhaven`,
      { fontFamily: '"Press Start 2P"', fontSize: '48px', fill: '#FFF' });

    this.scatterBtn = this.add.text(125, 325, `Login with Scatter`,
      { fontFamily: '"Press Start 2P"', fontSize: '18px', fill: '#FFF' });

    this.privKeyBtn = this.add.text(125, 350, `Login with Private Key`,
      { fontFamily: '"Press Start 2P"', fontSize: '18px', fill: '#FFF' });

    var logoutText: string = "Logout";
    this.logoutButton = this.add.text(125, 375, logoutText,
      { fontFamily: '"Press Start 2P"', fontSize: '18px', fill: '#FFF' });

    this.scatterBtn.setInteractive();
    //this.provider.events.once('loggedin', this.login, this);
    this.scatterBtn.once('pointerdown', () => {
      this.setupAndLogin();
    }, this);

    this.logoutButton.setInteractive();
    this.logoutButton.once('pointerdown', () => {
      this.provider.logout();
    }, this);

    this.privKeyBtn.setInteractive();
    this.privKeyBtn.once('pointerdown', () => {
      this.scene.start('PrivKeyScene');
    });
  }

  setupAndLogin() {
    this.provider = new ScatterProvider();
    this.provider.setProvider(PROVIDERS.SCATTER);
    this.provider.login();
  }

  login(account) {
    this.registry.set('account', account);
    this.scene.start("CharacterSelectScene");
  }

};
