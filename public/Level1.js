class Level1 extends Phaser.Scene {
  constructor() {
    super({ key: "Level1" });
  }

  preload() {
    this.load.image("tiles", "/assets/tilemaps/TX-Tileset-Grass.png");
    this.load.image("plants", "/assets/tilemaps/TX-Plant.png");
    this.load.tilemapTiledJSON("map", "assets/tilemaps/level-01.json");
    //
    //
    this.load.image("witch", "assets/sprites/square-witch.jpg");
    this.load.image("enemy", "assets/sprites/square-enemy.jpg");
    this.load.image("herb", "assets/sprites/square-herb.jpg");
    this.load.image("herb-active", "assets/sprites/square-herb-active.jpg");
    this.load.image(
      "square-projectile",
      "assets/sprites/square-projectile.jpg"
    );
    this.load.image("tree", "assets/sprites/square-tree.jpg");
  }

  create() {
    const map = this.make.tilemap({
      key: "map",
      tileWidth: 32,
      tileHeight: 32,
    });
    const groundTiles = map.addTilesetImage("TX Tileset Grass", "tiles");
    const treeTiles = map.addTilesetImage("TX Plant", "plants");

    gameState.groundLayer = map.createLayer("ground", groundTiles, 0, 0);
    gameState.treesLayer = map.createLayer("trees", treeTiles, 0, 0);
    // gameState.treesLayer also includes colliders for UI sidebar
    gameState.treesLayer.setCollisionByProperty({ collides: true });

    // // TURN ON to see colliders displayed
    const debugGraphics = this.add.graphics().setAlpha(0.75);
    gameState.treesLayer.renderDebug(debugGraphics, {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(200, 200, 200, 255),
    });

    gameState.herb = this.physics.add.sprite(645, 695, "herb").setScale(0.05);

    gameState.witch = this.physics.add.sprite(545, 900, "witch").setScale(0.05);
    gameState.witch.setCollideWorldBounds(true);
    this.physics.add.collider(gameState.witch, gameState.treesLayer);

    gameState.enemy = this.physics.add.sprite(415, 450, "enemy").setScale(0.06);
    gameState.enemy.setCollideWorldBounds(true);
    this.physics.add.collider(gameState.enemy, gameState.treesLayer);

    // when enemy touches witch, witch disappears and game over message displays:
    gameState.enemyWitchCollider = this.physics.add.collider(
      gameState.witch,
      gameState.enemy,
      () => {
        gameState.witch.setActive(false).setVisible(false);
        this.physics.pause();
        this.add.text(300, 400, "Defeat", {
          fontSize: "65px",
          fill: "#000000",
        });
      }
    );

    gameState.projectiles = this.physics.add.group();

    // TODO: this works *sometimes*
    this.physics.add.collider(
      gameState.projectiles,
      gameState.treesLayer,
      (projectile, tree) => {
        projectile.setVelocity(0, 0);
        projectile.setActive(false).setVisible(false);
        // destroy doesn't seem to do anything here
        projectile.destroy();
      }
    );

    // when a projectile touches enemy, enemy disappears and victory message displays:
    gameState.enemyProjectileCollider = this.physics.add.collider(
      gameState.enemy,
      gameState.projectiles,
      (enemy, projectile) => {
        gameState.enemy.setVelocity(0, 0);
        this.physics.world.removeCollider(gameState.enemyWitchCollider);
        gameState.enemy.setActive(false).setVisible(false);
        this.physics.pause();
        this.add.text(300, 400, "Victory", {
          fontSize: "65px",
          fill: "#000000",
        });
      }
    );

    gameState.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      // console.log(Phaser.Input.Keyboard.Keycodes) to find new ones
    });

    // const trees = this.physics.add.staticGroup();
    // trees.create(300, 950, "tree").setScale(0.17).refreshBody(); // tree1
    // trees.create(330, 865, "tree").setScale(0.17).refreshBody(); // tree2
    // trees.create(315, 775, "tree").setScale(0.17).refreshBody(); // tree3
    // trees.create(630, 680, "tree").setScale(0.17).refreshBody(); // tree4
    // trees.create(380, 370, "tree").setScale(0.17).refreshBody(); // tree5
    // trees.create(320, 460, "tree").setScale(0.17).refreshBody(); // tree6
    // trees.create(50, 150, "tree").setScale(0.17).refreshBody(); // tree7
    // trees.create(115, 230, "tree").setScale(0.17).refreshBody(); // tree8
    // trees.create(560, 130, "tree").setScale(0.17).refreshBody(); // tree9
    // trees.create(640, 200, "tree").setScale(0.17).refreshBody(); // tree10
    // trees.create(715, 280, "tree").setScale(0.17).refreshBody(); // tree11
    // trees.create(240, 45, "tree").setScale(0.17).refreshBody(); // tree12
    // this.physics.add.collider(gameState.witch, trees);
    // this.physics.add.collider(gameState.enemy, trees);
    // this.physics.add.collider(
    //   gameState.projectiles,
    //   trees,
    //   (projectile, tree) => {
    //     projectile.setActive(false).setVisible(false);
    //   }
    // );
  }

  update() {
    // WASD movement controls:
    gameState.witch.setVelocity(0, 0);
    if (gameState.cursors.left.isDown) {
      gameState.witch.setVelocityX(-100);
    }
    if (gameState.cursors.right.isDown) {
      gameState.witch.setVelocityX(100);
    }
    if (gameState.cursors.up.isDown) {
      gameState.witch.setVelocityY(-100);
    }
    if (gameState.cursors.down.isDown) {
      gameState.witch.setVelocityY(100);
    }

    // if enemy exists, it moves toward witch:
    if (gameState.enemy) {
      this.physics.moveToObject(gameState.enemy, gameState.witch, 50);
    }

    // determines whether witch is close enough to activate herb:
    const herbDistanceX = Math.abs(gameState.witch.x - gameState.herb.x);
    const herbDistanceY = Math.abs(gameState.witch.y - gameState.herb.y);
    gameState.inRadius = false;
    herbDistanceX < 100 && herbDistanceY < 100
      ? (gameState.inRadius = true)
      : (gameState.inRadius = false);
    // changes herb's appearance to indicate when it is active:
    gameState.inRadius
      ? gameState.herb.setTexture("herb-active")
      : gameState.herb.setTexture("herb");

    // on mouse click, if inRadius is true, launches projectiles:
    this.input.on("pointerdown", (pointer) => {
      if (gameState.inRadius) {
        const launched = gameState.projectiles
          .create(gameState.witch.x, gameState.witch.y, "square-projectile")
          .setScale(0.05);
        // projectile moves toward mouse position:
        this.physics.moveTo(launched, pointer.x, pointer.y, 150);
      }
    });

    // // TODO: this properly removes projectile but drastically slows down the game
    // this.physics.add.collider(
    //   gameState.projectiles,
    //   gameState.treesLayer,
    //   (projectile, tree) => {
    //     projectile.destroy();
    //   }
    // );
  }
}
