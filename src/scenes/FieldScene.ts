import "phaser";
import * as EasyStar from 'easystarjs';
import { Provider } from '../lib/providers/Provider';

export class FieldScene extends Phaser.Scene {

  character;
  controls;
  map;
  marker;
  camera;
  finder;
  player;
  anims;
  isWalking = false;
  network;
  rpc;
  provider;
  currentPath;
  events;

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
    this.events = new Phaser.Events.EventEmitter();
  }

  create(): void {
    this.provider = this.registry.get('provider');
    console.log('Hello from FieldScene');
    this.finder = new EasyStar.js();

    this.character = this.registry.values.characters[this.registry.values.activeCharacterIndex];

    this.map = this.make.tilemap({ key: "map" });
    const tileset = this.map.addTilesetImage("tuxmon-sample-32px", "tiles")
    

    const bg = this.map.createStaticLayer("Background", tileset, 0, 0);
    const below = this.map.createStaticLayer("Below Player", tileset, 0, 0);
    const above = this.map.createStaticLayer("Above Player", tileset, 0, 0);
    const gridTiles = this.map.createStaticLayer("Walkable", tileset, 0, 0);
    console.log(this.map);
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
    this.finder.setIterationsPerCalculation(1000);
    this.finder.enableDiagonals();

    let pos = this.map.getTileAt(this.character.position.x, this.character.position.y, false, "Walkable");
    console.log(`POS: `);
    console.log(pos);

    this.player = this.add.sprite(pos.pixelX + (pos.width / 2), pos.pixelY + (pos.height / 4), null);
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
    //this.camera.setZoom(2);
    
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
    this.input.on("pointerup", this.handleClick, this);

    const generateButton = this.add.text(100, 100, "Generate Mapdata", { fill: '#0f0' });
    generateButton.setInteractive();
    generateButton.on('pointerdown', () => {
      console.log('clicked button!');
      this.generateMapdata();
    });

    this.events.on("pathfound", () => {
      this.sendMoveTx(this.currentPath[this.currentPath.length - 1]);
    });

    this.provider.events.on("movesuccess", (result) => {
      console.log("Move succeeded");
      this.moveCharacter(this.currentPath);
      this.currentPath = null;
    });
  }

  longRun() {
    
  }

  update(time, delta): void {
    this.finder.calculate();
    this.controls.update(delta);
    
    let worldPoint = this.input.activePointer.positionToCamera(this.camera);
    //console.log(worldPoint);
    
    let pointerTileX = this.map.worldToTileX(worldPoint['x']);
    let pointerTileY = this.map.worldToTileY(worldPoint['y']);
    this.marker.x = this.map.tileToWorldX(pointerTileX);
    this.marker.y = this.map.tileToWorldY(pointerTileY);
    
    this.marker.setVisible(
      this.isWalking == false &&
      this.checkCollision(pointerTileX, pointerTileY)
    );

  }

  async handleClick(pointer) {
    let x = Math.floor(this.camera.scrollX + pointer.x);
    let y = Math.floor(this.camera.scrollY + pointer.y);
    let toX = Math.floor(x / this.map.tileWidth);
    let toY = Math.floor(y / this.map.tileHeight);
    // console.log(`Player: ${this.player.x}, ${this.player.y}`);
    let fromX = Math.floor(this.player.x / this.map.tileWidth);
    let fromY = Math.floor(this.player.y / this.map.tileHeight);
    // console.log(`Going from ${fromX}, ${fromY} to ${toX}, ${toY}`);
    if (!this.isWalking) {
      this.finder.findPath(fromX, fromY, toX, toY, (path) => {
        if (path !== null) {
          if (!this.distanceWithinMovementRadius(fromX, fromY, toX, toY)) {
            let sliceAt;
            for (let i = 0; i < path.length; i ++) {
              if (!this.distanceWithinMovementRadius(fromX, fromY, path[i].x, path[i].y)) {
                sliceAt = i;
                break;
              }
            }
            path = path.slice(0, sliceAt);
          }
          this.currentPath = path;
          this.events.emit("pathfound");
          // console.log('pathfound');
        }
      });
    }
    return;
  }

 async sendMoveTx(endPosition) {
    let data = {
      user: this.registry.values.account.name,
      character_id: this.character.character_id,
      new_position: {
        orientation: 0,
        world_zone_id: parseInt(this.character.position.world_zone_id),
        x: endPosition.x,
        y: endPosition.y
      }
    };
    let account = this.registry.get("account");
    console.log('sending move tx');
    this.provider.move(account, data);
  }

  async moveCharacter(path) {
    let tweens = [];
    let total = 0;
    let perPathDuration = 180;
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

  private generateMapdata() {
    let tiles = [];
    const gridData = this.map.layers.filter(l => l.name == "Walkable")[0].data;
    gridData.forEach((row) => {
      row.forEach((col) => {
        let isWalkable = col.index !== -1;
        tiles.push({
          coordinates: { x: col.x, y: col.y },
          attributes: JSON.stringify({ walkable: isWalkable })
        });
      });
    });
    console.log(JSON.stringify(tiles));
  }
};
