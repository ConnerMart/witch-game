// import Phaser from "phaser";

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
      //   gravity: { y: 200 },
      enableBody: true,
    },
  },
  scene: [Level1],
};

const game = new Phaser.Game(config);
