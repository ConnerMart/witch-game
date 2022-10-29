// export default gameState = {};

import Phaser from "phaser";

import MainMenu from "./MainMenu";
import Level1 from "./Level1";

const config = {
  type: Phaser.AUTO,
  audio: {
    disableWebAudio: true,
  },
  width: 1280,
  height: 960,
  backgroundColor: "5C920D",
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
