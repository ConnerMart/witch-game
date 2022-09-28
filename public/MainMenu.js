class MainMenu extends Phaser.Scene {
  constructor() {
    super({ key: "MainMenu" });
  }

  create() {
    this.add.text(300, 400, "Click to Start\nPress Space to Attack", {
      fontSize: "50px",
      fill: "#000000",
    });
    this.input.on("pointerdown", () => {
      this.scene.stop("MainMenu");
      this.scene.start("Level1");
    });
  }
}
