import { Scene } from "./scene";
import { Assets } from "./assets";
import { Controller } from "./controller";
import { replaceChildren } from "./helpers";
import { createConversation } from "./dialogue";
import { assetsPath } from "./assetMap";
import { GameAudio } from "./audio";

export class Game {
  lastProcess: number = performance.now();
  scene: Scene;
  assets: Assets;
  controller: Controller = new Controller();
  root: HTMLElement 
  isActive: boolean = false;
  audio: GameAudio;
  constructor(assets: Assets, root: HTMLElement) {
    this.assets = assets;
    this.root = root;
    this.scene = new Scene(assets, this);
    this.audio = new GameAudio(assets);
  }
  
  /**
   * Process loop. Delta is time passed in milliseconds
   * @param delta 
   */
  process(delta: number): void {
    // Process controls
    this.controller.process(this.scene);
    // Process scene
    this.scene.process(delta);
  }
  
  attach(): void {
    replaceChildren(this.root, this.scene.domElement);
    this.controller.attach();
  }
  
  /**
   * Makes the dialogue for completing the game
   */
  onGameComplete(): void {
    this.isActive = false;
    // Change to letter
    window.location.href = './letter';
  }
  
  start(): void {
    this.isActive = true;
    const loop = () => {
      const newTime = performance.now();
      const delta = newTime - this.lastProcess;
      this.lastProcess = newTime;
      if (this.isActive) {
        this.process(delta);
      }
      requestAnimationFrame(loop);
    }
    loop();
  }
}
