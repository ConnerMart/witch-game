const gameState = {};

const config = {
  type: Phaser.AUTO,
  audio: {
    disableWebAudio: true,
  },
  width: 1280,
  height: 960,
  // // width: 240,
  // // height: 160,
  // scale: {
  //   parent: "body",
  //   width: 720,
  //   height: 480,
  // },
  backgroundColor: "148C0C",
  physics: {
    default: "arcade",
    arcade: {
      enableBody: true,
      debug: true,
    },
  },
  scene: [MainMenu, Level1],
};

const game = new Phaser.Game(config);
