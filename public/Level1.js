class Level1 extends Phaser.Scene {
  constructor() {
    super({ key: "Level1" });
  }

  preload() {
    this.load.image("tiles", "/assets/tilemaps/TX-Tileset-Grass.png");
    this.load.image("plants", "/assets/tilemaps/TX-Plant.png");
    this.load.tilemapTiledJSON("map", "assets/tilemaps/level-01.json");

    this.load.atlas(
      "witch",
      "/assets/sprites/witch-1.png",
      "/assets/sprites/witch-1_atlas.json"
    );
    this.load.animation("witch_anim", "assets/sprites/witch-1_anim.json");

    this.load.atlas(
      "enemy",
      "/assets/sprites/enemy-1.png",
      "/assets/sprites/enemy-1_atlas.json"
    );
    this.load.animation("enemy_anim", "assets/sprites/enemy-1_anim.json");

    this.load.image("herb", "assets/sprites/herb-1.png");
    this.load.image("herb-active", "assets/sprites/herb-1-active.png");

    this.load.image("projectile-1", "assets/sprites/projectile-1.png");
  }

  create() {
    this.physics.world.setFPS(120);
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

    // TURN ON to see colliders displayed
    const debugGraphics = this.add.graphics().setAlpha(0.75);
    gameState.treesLayer.renderDebug(debugGraphics, {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(200, 200, 200, 255),
    });

    gameState.herb = this.physics.add.sprite(645, 695, "herb").setScale(1.5);

    gameState.witch = this.physics.add
      .sprite(545, 900, "witch", "up_stand")
      .setScale(2);
    gameState.witch.setCollideWorldBounds(true);
    this.physics.add.collider(gameState.witch, gameState.treesLayer);

    gameState.enemy = this.physics.add
      .sprite(415, 450, "enemy", "down_stand")
      .setScale(2.5);
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

    this.physics.add.collider(
      gameState.projectiles,
      gameState.treesLayer,
      (projectile, tree) => {
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
  }

  update() {
    // WASD movement controls:
    gameState.witch.setVelocity(0, 0);

    if (gameState.cursors.left.isDown) {
      gameState.witch.setVelocityX(-100);
      gameState.witch.anims.play("left_walk", true);
    } else if (gameState.cursors.right.isDown) {
      gameState.witch.setVelocityX(100);
      gameState.witch.anims.play("right_walk", true);
    } else if (gameState.cursors.up.isDown) {
      gameState.witch.setVelocityY(-100);
      gameState.witch.anims.play("up_walk", true);
    } else if (gameState.cursors.down.isDown) {
      gameState.witch.setVelocityY(100);
      gameState.witch.anims.play("down_walk", true);
    } else {
      gameState.witch.anims.pause();
    }

    // if enemy exists, it moves toward witch:
    if (gameState.enemy) {
      this.physics.moveToObject(gameState.enemy, gameState.witch, 50);
      gameState.enemy.anims.play("down_walk_enemy", true);
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
          .create(gameState.witch.x, gameState.witch.y, "projectile-1")
          .setScale(0.35);
        // projectile moves toward mouse position:
        this.physics.moveTo(launched, pointer.x, pointer.y, 150);
      }
    });
  }
}
