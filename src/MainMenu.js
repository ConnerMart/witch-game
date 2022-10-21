export default class MainMenu extends Phaser.Scene {
  constructor() {
    super({ key: "MainMenu" });
  }

  create() {
    this.add.text(400, 300, "Click to Start", {
      fontSize: "50px",
      fill: "#000000",
    });
    this.add.text(
      500,
      400,
      "Move with WASD\n\nClick to Attack\n When Powered",
      {
        fontSize: "25px",
        fill: "#000000",
      }
    );
    this.input.on("pointerdown", () => {
      this.scene.stop("MainMenu");
      this.scene.start("Level1");
    });
  }
}
