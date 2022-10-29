const gameState = {};

class Herb extends Phaser.GameObjects.Sprite {
  constructor(config) {
    super(config.scene, config.x, config.y, "herb");
    config.scene.add.existing(this);
  }

  checkDistance(herbX, herbY) {
    const herbDistanceX = Math.abs(gameState.witch.x - herbX);
    const herbDistanceY = Math.abs(gameState.witch.y - herbY);
    if (herbDistanceX < 100 && herbDistanceY < 100) {
      return true;
    } else {
      return false;
    }
  }
}

class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(config) {
    super(config.scene, config.x, config.y, "enemy");
    this.scene.physics.add.existing(this);
    this.scene.add.existing(this);
    this.setScale(2.5);
    this.setCollideWorldBounds(true);
    // this.enemyTreeCollider = this.scene.physics.add.collider(
    //   this,
    //   gameState.treesLayer
    // );
  }

  // when enemy touches witch, witch disappears and game over message displays:
  enemyWitchCollider = this.scene.physics.add.collider(
    gameState.witch,
    this,
    () => {
      gameState.witch.setActive(false).setVisible(false);
      this.scene.physics.pause();
      this.scene.add.text(450, 400, "Defeat", {
        fontSize: "65px",
        fill: "#000000",
      });
    }
  );

  isAlive = true;
}

export default class Level1 extends Phaser.Scene {
  constructor() {
    super({ key: "Level1" });
  }

  preload() {
    // tilesets and tilemap:
    this.load.image("tiles", "/assets/tilemaps/TX-Tileset-Grass.png");
    this.load.image("plants", "/assets/tilemaps/TX-Plant.png");
    this.load.tilemapTiledJSON("map", "assets/tilemaps/level-01.json");

    // witch sprite atlas and animations:
    this.load.atlas(
      "witch",
      "/assets/sprites/witch-1.png",
      "/assets/sprites/witch-1_atlas.json"
    );
    this.load.animation("witch_anim", "assets/sprites/witch-1_anim.json");

    // enemy sprite atlas and animations:
    this.load.atlas(
      "enemy",
      "/assets/sprites/enemy-1.png",
      "/assets/sprites/enemy-1_atlas.json"
    );
    this.load.animation("enemy_anim", "assets/sprites/enemy-1_anim.json");

    // herb sprite and active version:
    this.load.image("herb", "assets/sprites/herb-1.png");
    this.load.image("herb-active", "assets/sprites/herb-1-active.png");

    // projectile sprite:
    this.load.image("projectile-1", "assets/sprites/projectile-1.png");
  }

  create() {
    this.physics.world.setFPS(120);
    gameState.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      // console.log(Phaser.Input.Keyboard.Keycodes) to find new ones
    });

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

    gameState.witch = this.physics.add
      .sprite(545, 900, "witch", "up_stand")
      .setScale(2);
    gameState.witch.setCollideWorldBounds(true);
    this.physics.add.collider(gameState.witch, gameState.treesLayer);

    // // this needs to be a sprite(?) to move along w/ witch
    // gameState.auraCircle = this.add.circle(
    //   gameState.witch.x,
    //   gameState.witch.y,
    //   100,
    //   0x4d39e0,
    //   150
    // );

    gameState.herbArray = [
      (gameState.herb1 = new Herb({ scene: this, x: 630, y: 670 })),
      (gameState.herb2 = new Herb({ scene: this, x: 720, y: 400 })),
      (gameState.herb3 = new Herb({ scene: this, x: 240, y: 760 })),
      (gameState.herb4 = new Herb({ scene: this, x: 305, y: 290 })),
    ];

    gameState.enemyArray = [
      (gameState.enemy1 = new Enemy({ scene: this, x: 415, y: 450 })),
      (gameState.enemy2 = new Enemy({ scene: this, x: 850, y: 300 })),
      (gameState.enemy3 = new Enemy({ scene: this, x: 415, y: 150 })),
    ];

    gameState.projectiles = this.physics.add.group();
    this.physics.add.collider(
      gameState.projectiles,
      gameState.treesLayer,
      (projectile, tree) => {
        projectile.destroy();
      }
    );

    gameState.enemyProjectileCollider = this.physics.add.collider(
      [...gameState.enemyArray],
      gameState.projectiles,
      (enemy, projectile) => {
        enemy.setVelocity(0, 0);
        enemy.setActive(false).setVisible(false);
        this.physics.world.removeCollider(enemy.enemyWitchCollider);
        projectile.destroy();

        enemy.isAlive = false;
      }
    );

    //
    //
    // this.physics.add.collider(
    //   gameState.enemyArray,
    //   gameState.treesLayer,
    //   (enemy, tree) => {
    //     console.log(enemy);
    //   }
    // );

    gameState.passThrough = false;
  }

  update() {
    // WASD movement controls:
    gameState.witch.setVelocity(0, 0);
    // add idle animation here //
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

    // all enemies move toward witch
    for (const enemy of gameState.enemyArray) {
      // this.physics.moveToObject(enemy, gameState.witch, 50);
      this.physics.moveTo(enemy, gameState.witch.x, gameState.witch.y, 50);
      enemy.anims.play("down_walk_enemy", true);
    }

    // gameState.treeTimer = setTimeout(() => {
    //   gameState.passThrough = !gameState.passThrough;
    //   // setTimeout(() => {
    //   //   gameState.passThrough = false;
    //   // }, 2000);
    // }, 4000);

    // if (gameState.passThrough) {
    //   for (const enemy of gameState.enemyArray) {
    //     this.physics.world.removeCollider(enemy.enemyTreeCollider);
    //     this.physics.world.removeCollider(enemy.enemyTreeCollider);
    //     this.physics.world.removeCollider(enemy.enemyTreeCollider);
    //   }
    // }

    for (const herb of gameState.herbArray) {
      if (herb.checkDistance(herb.x, herb.y)) {
        herb.setTexture("herb-active");
        herb.active = true;
      } else {
        herb.setTexture("herb");
        herb.active = false;
      }
    }

    // on mouse click, if herb.active is true for ANY member of herbArray, launches projectiles:
    this.input.on("pointerdown", (pointer) => {
      for (const herb of gameState.herbArray) {
        if (herb.active) {
          const launched = gameState.projectiles
            .create(gameState.witch.x, gameState.witch.y, "projectile-1")
            .setScale(0.35);
          // projectile moves toward mouse position:
          this.physics.moveTo(launched, pointer.x, pointer.y, 150);
        }
      }
    });

    // TODO: refactor this:
    // is none of the 3 enemies are alive, victory screen displays
    if (
      !gameState.enemy1.isAlive &&
      !gameState.enemy2.isAlive &&
      !gameState.enemy3.isAlive
    ) {
      // this.physics.pause();
      this.add.text(450, 400, "Victory", {
        fontSize: "65px",
        fill: "#000000",
      });
    }
  }
}
