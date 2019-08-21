import "phaser";

export class GameScene extends Phaser.Scene {
  delta: number;
  lastStarTime: number;
  starsCaught: number;
  starsFallen: number;
  sand: Phaser.Physics.Arcade.StaticGroup;
  info: Phaser.GameObjects.Text;
  emitter: Phaser.Events.EventEmitter;

  constructor() {
    super({
      key: "GameScene"
    });
  }

  init(params: any): void {
    console.log(params);
    this.delta = 1000;
    this.lastStarTime = 0;
    this.starsCaught = 0;
    this.starsFallen = 0;
  }

  preload(): void {
    this.load.setBaseURL("http://127.0.0.1:8085");
    this.load.image("star", "assets/star.png");
    this.load.image("sand", "assets/sand.jpg");
  }

  create(): void {
    this.emitter = new Phaser.Events.EventEmitter();

    this.emitter.on('starFall', this.handler, this);
    this.sand = this.physics.add.staticGroup({
      key: 'sand',
      frameQuantity: 20
    });
    Phaser.Actions.PlaceOnLine(this.sand.getChildren(),
      new Phaser.Geom.Line(20, 580, 820, 580));
    this.sand.refresh();

    this.info = this.add.text(10, 10, '',
      { font: '24px Arial Bold', fill: '#FBFBAC' });
  }

  update(time: number): void {
    var diff: number = time - this.lastStarTime;
    if (diff > this.delta) {
      this.lastStarTime = time;
      if (this.delta > 500) {
        this.delta -= 20;
      }
      this.emitStar();
    }
    this.info.text =
      this.starsCaught + " caught - " +
      this.starsFallen + " fallen (max 3)";
  }

  private onClick(star: Phaser.Physics.Arcade.Image): () => void {
    return (() => {
      star.setTint(0x00ff00);
      star.setVelocity(0, 0);
      this.starsCaught += 1;
      this.time.delayedCall(50, function (star) {
        star.destroy();
      }, [star], this);
    })
  }

  private onFall(star: Phaser.Physics.Arcade.Image): () => void {
    return (() => {
      star.setTint(0xff0000);
      this.starsFallen += 1;
      this.emitter.emit('starFall', this.handler, this);
      this.time.delayedCall(50, (star) => {
        star.destroy();
        if (this.starsFallen > 2) {
          this.loadScene();
        }
      }, [star], this)
    })
  }

  private handler() {
    console.log('Hello from handler!');
  }

  private loadScene() {
    this.scene.start("ScoreScene", { starsCaught: this.starsCaught });
  }

  private emitStar(): void {
    var star: Phaser.Physics.Arcade.Image;
    var x = Phaser.Math.Between(25, 775);
    var y = 26;
    star = this.physics.add.image(x, y, "star");

    star.setDisplaySize(50, 50);
    star.setVelocity(0, 500);
    star.setInteractive();

    star.on('pointerdown', this.onClick(star), this);
    this.physics.add.collider(star, this.sand, this.onFall(star), this.processCallback, this);
  }

  private processCallback(): () => void {
    return (() => {
      console.log('Hello from processCallback');
    })
  }
};
