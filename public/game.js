const gameState = {};

const config = {
  type: Phaser.AUTO,
  audio: {
    disableWebAudio: true,
  },
  width: 1000,
  height: 1000,
  backgroundColor: "148C0C",
  physics: {
    default: "arcade",
    arcade: {
      enableBody: true,
    },
  },
  scene: [MainMenu, Level1],
};

const game = new Phaser.Game(config);
