import "phaser";

export class FieldScene extends Phaser.Scene {

  controls;
  map;
  marker;
  camera;

  constructor() {
    super({
      key: "FieldScene"
    });
  }

  preload(): void {
    this.load.setBaseURL("http://127.0.0.1:8887");
    this.load.image("tiles", "assets/tilesets/tuxmon-sample-32px.png");
    this.load.tilemapTiledJSON("map", "assets/tilemaps/map_1.json");
  }

  create(): void {
    console.log('Hello from FieldScene');
    this.physics.world.createDebugGraphic();
    this.map = this.make.tilemap({ key: "map" });
    const tileset = this.map.addTilesetImage("tuxmon-sample-32px", "tiles");

    const bg = this.map.createStaticLayer("Background", tileset, 0, 0);
    const gridTiles = this.map.createStaticLayer("Grid", tileset, 0, 0);
    const objects = this.map.createStaticLayer("Objects", tileset, 0, 0);
    objects.setDepth(20);

    this.marker = this.add.graphics();
    this.marker.setDepth(10);
    this.marker.lineStyle(3, 0xffffff, 1);
    this.marker.strokeRoundedRect(3, 3, this.map.tileWidth - 6, this.map.tileHeight - 6, 3);

    this.camera = this.cameras.main;
    this.camera.setRoundPixels(true);
    this.camera.setZoom(2);

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
  }

  update(time, delta): void {
    this.controls.update(delta);

    let worldPoint = this.input.activePointer.positionToCamera(this.camera);
    //console.log(worldPoint);
    
    let pointerTileX = this.map.worldToTileX(worldPoint['x']);
    let pointerTileY = this.map.worldToTileY(worldPoint['y']);
    this.marker.x = this.map.tileToWorldX(pointerTileX);
    this.marker.y = this.map.tileToWorldY(pointerTileY);
    
    this.marker.setVisible(this.checkCollision(pointerTileX, pointerTileY));

  }

  private checkCollision(x, y) {
    let tile = this.map.getTileAt(x, y, false, "Grid");
    return ( tile ? true : false );
  }
};
