import "phaser";
import { Provider } from '../lib/providers/Provider';

export class LoginScene extends Phaser.Scene {
  title: Phaser.GameObjects.Text;
  loginButton: Phaser.GameObjects.Text;
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

    this.loginButton = this.add.text(125, 325, `Login with Scatter`,
      { fontFamily: '"Press Start 2P"', fontSize: '18px', fill: '#FFF' });

    this.privKeyBtn = this.add.text(125, 350, `Login with Private Key`,
      { fontFamily: '"Press Start 2P"', fontSize: '18px', fill: '#FFF' });

    var logoutText: string = "Logout";
    this.logoutButton = this.add.text(125, 375, logoutText,
      { fontFamily: '"Press Start 2P"', fontSize: '18px', fill: '#FFF' });

    this.loginButton.setInteractive();
    //this.provider.events.once('loggedin', this.login, this);
    this.loginButton.once('pointerdown', () => {
      this.provider.login();
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

  login(account) {
    this.registry.set('account', account);
    this.scene.start("CharacterSelectScene");
  }

};
