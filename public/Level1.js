class Level1 extends Phaser.Scene {
  constructor() {
    super({ key: "Level1" });
  }

  preload() {
    this.load.image("witch", "assets/sprites/square-witch.jpg");
    this.load.image("enemy", "assets/sprites/square-enemy.jpg");
    this.load.image("herb", "assets/sprites/square-herb.jpg");
    this.load.image("herb-active", "assets/sprites/square-herb-active.jpg");
    this.load.image(
      "square-projectile",
      "assets/sprites/square-projectile.jpg"
    );
    this.load.image("tree", "assets/sprites/square-tree.jpg");
    this.load.image("side-panel", "assets/sprites/side-panel.jpg");
  }

  create() {
    const sidePanel = this.physics.add.staticGroup();
    sidePanel.create(950, 500, "side-panel").setScale(0.6).refreshBody();

    gameState.herb = this.physics.add.sprite(600, 650, "herb").setScale(0.08);

    gameState.witch = this.physics.add.sprite(400, 950, "witch").setScale(0.08);
    gameState.witch.setCollideWorldBounds(true);
    this.physics.add.collider(gameState.witch, sidePanel);

    gameState.enemy = this.physics.add.sprite(400, 450, "enemy").setScale(0.08);
    gameState.enemy.setCollideWorldBounds(true);
    this.physics.add.collider(gameState.enemy, sidePanel);

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

    const trees = this.physics.add.staticGroup();
    trees.create(100, 900, "tree").setScale(0.12).refreshBody(); // tree1
    this.physics.add.collider(gameState.witch, trees);
  }

  update() {
    // WASD movement controls:
    if (gameState.cursors.left.isDown) {
      gameState.witch.setVelocityX(-100);
    } else if (gameState.cursors.right.isDown) {
      gameState.witch.setVelocityX(100);
    } else if (gameState.cursors.up.isDown) {
      gameState.witch.setVelocityY(-100);
    } else if (gameState.cursors.down.isDown) {
      gameState.witch.setVelocityY(100);
    } else {
      gameState.witch.setVelocity(0, 0);
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
  }
}
