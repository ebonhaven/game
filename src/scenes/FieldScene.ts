import "phaser";
import * as EasyStar from 'easystarjs';

export class FieldScene extends Phaser.Scene {

  controls;
  map;
  marker;
  camera;
  finder;
  player;
  anims;
  isWalking = false;

  constructor() {
    super({
      key: "FieldScene"
    });
  }

  preload(): void {
    this.load.setBaseURL("http://127.0.0.1:8887");
    this.load.image("tiles", "assets/tilesets/tuxmon-sample-32px.png");
    this.load.tilemapTiledJSON("map", "assets/tilemaps/map_1.json");
    this.load.atlas("sprites", "assets/sprites/sprites.png", "assets/sprites/sprites.json");
  }

  create(): void {
    console.log('Hello from FieldScene');
    this.finder = new EasyStar.js();


    this.map = this.make.tilemap({ key: "map" });
    const tileset = this.map.addTilesetImage("tuxmon-sample-32px", "tiles");
    console.log(this.map);

    const bg = this.map.createStaticLayer("Background", tileset, 0, 0);
    const below = this.map.createStaticLayer("Below Player", tileset, 0, 0);
    const above = this.map.createStaticLayer("Above Player", tileset, 0, 0);
    const gridTiles = this.map.createStaticLayer("Walkable", tileset, 0, 0);
    above.setDepth(20);

    let grid = [];
    for ( let y = 0; y < this.map.tileHeight; y++ ) {
      let col = [];
      for (let x = 0; x < this.map.tileWidth; x++ ) {
        col.push(this.getTileId(x, y));
      }
      grid.push(col);
    }
    this.finder.setGrid(grid);
    let acceptableTiles = [];
    for (let i = this.map.tilesets[0].firstgid - 1; i < tileset.total; i++) {
      acceptableTiles.push(i + 1);
      continue;
    }
    this.finder.setAcceptableTiles(acceptableTiles);

    this.player = this.add.sprite((this.map.widthInPixels / 2) - (this.map.tileWidth / 2), this.map.heightInPixels / 2, null);
    this.player.setScale(2.25, 2.25);
    this.player.setDepth(11);
    [
      "up",
      "right",
      "down",
      "left",
      "hit-up",
      "hit-right",
      "hit-down",
      "hit-left"
    ].forEach(key => {
      this.anims.create({
        key: "hero/" + key,
        frames: this.anims.generateFrameNames("sprites", {
          prefix: "hero/hero-" + key + "-",
          end: 1
        }),
        frameRate: 5,
        repeat: -1,
        repeatDelay: 0
      });
    });
    this.player.play("hero/right");

    this.marker = this.add.graphics();
    this.marker.setDepth(10);
    this.marker.lineStyle(3, 0xffffff, 1);
    this.marker.strokeRoundedRect(1, 1, this.map.tileWidth - 2, this.map.tileHeight - 2, 3);

    this.camera = this.cameras.main;
    
    const cursors = this.input.keyboard.createCursorKeys();
    this.controls = new Phaser.Cameras.Controls.FixedKeyControl({
      camera: this.camera,
      left: cursors.left,
      right: cursors.right,
      up: cursors.up,
      down: cursors.down,
      speed: 0.5
    });

    this.camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.camera.startFollow(this.player, true, 0.25, 0.25);
    console.log(this.camera);
    this.input.on("pointerup", this.handleClick, this );
  }

  update(time, delta): void {
    this.controls.update(delta);

    let worldPoint = this.input.activePointer.positionToCamera(this.camera);
    //console.log(worldPoint);
    
    let pointerTileX = this.map.worldToTileX(worldPoint['x']);
    let pointerTileY = this.map.worldToTileY(worldPoint['y']);
    this.marker.x = this.map.tileToWorldX(pointerTileX);
    this.marker.y = this.map.tileToWorldY(pointerTileY);
    let fromX = Math.floor(this.player.x / this.map.tileWidth );
    let fromY = Math.floor(this.player.y / this.map.tileHeight );
    
    this.marker.setVisible(
      this.isWalking == false &&
      this.checkCollision(pointerTileX, pointerTileY) &&
      this.distanceWithinMovementRadius(fromX, fromY, pointerTileX, pointerTileY) == true
    );

  }



  handleClick(pointer) {
    console.log('clicked!');
    // console.log(this.camera);
    let x = Math.floor(this.camera.scrollX + pointer.x);
    let y = Math.floor(this.camera.scrollY + pointer.y);
    let toX = Math.floor(x / this.map.tileWidth);
    let toY = Math.floor(y/ this.map.tileHeight);
    // console.log(`Player: ${this.player.x}, ${this.player.y}`);
    let fromX = Math.floor(this.player.x / this.map.tileWidth );
    let fromY = Math.floor(this.player.y / this.map.tileHeight );
    // console.log(`Going from ${fromX}, ${fromY} to ${toX}, ${toY}`);


    if (!this.isWalking && this.distanceWithinMovementRadius(fromX, fromY, toX, toY)) {
      this.finder.findPath(fromX, fromY, toX, toY, (path) => {
        console.log(path);
        if (path !== null) {
          this.moveCharacter(path);
        }
      });
      this.finder.calculate();
    }
  }

  moveCharacter(path) {
    let tweens = [];
    let total = 0;
    let perPathDuration = 100;
    for (let i = 0; i < path.length - 1; i++) {
      let ex = path[i+1].x;
      let ey = path[i+1].y;
      tweens.push({
        targets: this.player,
        x: { value: (ex * this.map.tileWidth) + (this.map.tileWidth / 2), duration: perPathDuration },
        y: { value: (ey * this.map.tileHeight), duration: perPathDuration }
      })
      total += perPathDuration;
    }
    this.isWalking = true;
    this.tweens.timeline({
      totalDuration: total,
      tweens: tweens
    });
    setTimeout(() => {
      this.isWalking = false;
    }, total);
  };

  private distanceWithinMovementRadius(fromX, fromY, toX, toY, radius = 3.5) {
    let distance = Phaser.Math.Distance.Between(fromX, fromY, toX, toY);
    return (distance <= radius ? true : false);
  }

  private checkCollision(x, y) {
    let tile = this.map.getTileAt(x, y, false, "Walkable");
    return ( tile ? true : false );
  }

  private getTileId(x, y) {
    let tile = this.map.getTileAt(x, y, false, "Walkable");
    return (tile ? tile.index : 0);
  }
};
