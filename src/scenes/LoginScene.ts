import "phaser";
import { Scatter } from '../lib/Scatter';

export class LoginScene extends Phaser.Scene {
  title: Phaser.GameObjects.Text;
  loginButton: Phaser.GameObjects.Text;
  logoutButton: Phaser.GameObjects.Text;
  scatter;

  constructor() {
    super({
      key: "LoginScene"
    });
    this.scatter = new Scatter();
  }

  create(): void {
    console.log('creating login scene');
    var titleText: string = "Ebonhaven";
    this.title = this.add.text(150, 200, titleText,
      { font: '86px Arial Bold', fill: '#FFF' });

    var loginText: string = "Login";
    this.loginButton = this.add.text(300, 350, loginText,
      { font: '24px Arial Bold', fill: '#FFF' });

    var logoutText: string = "Logout";
    this.logoutButton = this.add.text(300, 375, logoutText,
      { font: '24px Arial Bold', fill: '#FFF' });

    this.loginButton.setInteractive();
    this.scatter.events.on('loggedin', this.login, this);
    this.loginButton.on('pointerdown', () => {
      this.scatter.login();
    });

    this.logoutButton.setInteractive();
    this.logoutButton.on('pointerdown', () => {
      this.scatter.logout();
    });
  }

  login(account) {
    this.registry.set('account', account);
    this.scene.switch("CharacterSelectScene");
  }

};
