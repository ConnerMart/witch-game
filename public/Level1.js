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
  }

  create() {
    gameState.herb = this.physics.add.sprite(750, 600, "herb").setScale(0.08);

    gameState.witch = this.physics.add.sprite(500, 850, "witch").setScale(0.08);
    gameState.witch.setCollideWorldBounds(true);

    gameState.enemy = this.physics.add.sprite(500, 250, "enemy").setScale(0.08);
    gameState.enemy.setCollideWorldBounds(true);

    // when enemy touches witch, witch disappears and game over message displays:
    gameState.enemyWitchCollider = this.physics.add.collider(
      gameState.witch,
      gameState.enemy,
      () => {
        gameState.witch.destroy();
        this.physics.pause();
        this.add.text(325, 400, "Game Over", {
          fontSize: "65px",
          fill: "#000000",
        });
      }
    );

    // when a projectile touches enemy, enemy disappears and victory message displays:
    gameState.projectiles = this.physics.add.group();
    gameState.enemyProjectileCollider = this.physics.add.collider(
      gameState.enemy,
      gameState.projectiles,
      (enemy, projectile) => {
        gameState.enemy.setVelocity(0, 0);
        this.physics.world.removeCollider(gameState.enemyWitchCollider);
        gameState.enemy.setActive(false).setVisible(false);
        this.physics.pause();
        this.add.text(325, 400, "Victory", {
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
      shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      // leftMouse: Phaser.Input.MOUSE_UP,
    });
  }

  update() {
    // WASD movement controls:
    if (gameState.cursors.left.isDown) {
      gameState.witch.x -= 3;
    }
    if (gameState.cursors.right.isDown) {
      gameState.witch.x += 3;
    }
    if (gameState.cursors.up.isDown) {
      gameState.witch.y -= 3;
    }
    if (gameState.cursors.down.isDown) {
      gameState.witch.y += 3;
    }

    // if enemy exists, it moves toward witch:
    if (gameState.enemy) {
      this.physics.moveToObject(gameState.enemy, gameState.witch, 60);
    }

    // determines whether witch is close enough to activate herb
    const herbDistanceX = Math.abs(gameState.witch.x - gameState.herb.x);
    const herbDistanceY = Math.abs(gameState.witch.y - gameState.herb.y);
    gameState.inRadius = false;
    herbDistanceX < 100 && herbDistanceY < 100
      ? (gameState.inRadius = true)
      : (gameState.inRadius = false);

    // changes herb's appearance to indicate when it is active
    gameState.inRadius
      ? gameState.herb.setTexture("herb-active")
      : gameState.herb.setTexture("herb");

    // on mouse click, if inRadius is true, launch projectiles
    this.input.on("pointerdown", (pointer) => {
      if (gameState.inRadius) {
        const launched = gameState.projectiles
          .create(gameState.witch.x, gameState.witch.y, "square-projectile")
          .setScale(0.05);
        this.physics.moveToObject(launched, gameState.enemy, 80);
      }
    });

    // // older version:space bar kills enemy:
    // if (herbDistanceX < 100 && herbDistanceY < 100) {
    //   gameState.herb.setTexture("herb-active");
    //   if (Phaser.Input.Keyboard.JustDown(gameState.cursors.space)) {
    //     gameState.enemy.setVelocity(0, 0);
    //     this.physics.world.removeCollider(gameState.enemyWitchCollider);
    //     gameState.enemy.setActive(false).setVisible(false);
    //   }
    // } else {
    //   gameState.herb.setTexture("herb");
    // }
  }
}
