import { Player } from "./player";
import { Scene } from "./scene";

export enum Direction {
  Right,
  Left,
}

export type PlayerInput = {
  // Negative to move left positive to move right
  move?: Direction;
  jump?: boolean;
}

export class Controller {
  keyPresses: Set<string> = new Set();
  touchStartX: number | null = null;
  touchEndX: number | null = null;
  touchStartY: number | null = null;
  touchEndY: number | null = null;
  swipeThreshold: number = 50;
  jumpThreshold: number = 50;
  
  attach(): void {
    // For keyboard
    window.addEventListener('keydown', e => {
      // Store the keypress value
      this.keyPresses.add(e.key.toLowerCase());
    })
    window.addEventListener('keyup', e => {
      // Store the keypress value
      this.keyPresses.delete(e.key.toLowerCase());
    })
    // For mobile
    window.addEventListener('touchstart', e => {
      this.touchStartX = e.changedTouches[0].screenX;
      this.touchStartY = e.changedTouches[0].screenY;
    })
    window.addEventListener('touchend', e => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.touchEndY = e.changedTouches[0].screenY;
    })
  }
  
  process(scene: Scene): void {
    // console.log(this.keyPresses.size);
    let pInput: PlayerInput = {};
    if (this.keyPresses.has('a')) {
      pInput.move = Direction.Left;
    }
    if (this.keyPresses.has('d')) {
      pInput.move = Direction.Right;
    }
    if (this.keyPresses.has('w')) {
      pInput.jump = true;
    }
    // Check if swiped
    if (this.touchStartX !== null && this.touchEndX !== null) {
      // Move left
      if (this.touchStartX - this.touchEndX > this.swipeThreshold) {
        pInput.move = Direction.Left;
      }
      // Move right
      if (this.touchEndX - this.touchStartX > this.swipeThreshold) {
        pInput.move = Direction.Right;
      }
      this.touchStartX = null;
      this.touchEndX = null;
    }
    if (this.touchStartY !== null && this.touchEndY !== null) {
      if (this.touchStartY - this.touchEndY > this.jumpThreshold) {
        pInput.jump = true;
      }
      this.touchStartY = null;
      this.touchEndY = null;
    }
    // Wipe keypresses
    this.keyPresses = new Set();
    if (Object.keys(pInput).length > 0) {
      scene.onPlayerInput(pInput);
    }
  }
}