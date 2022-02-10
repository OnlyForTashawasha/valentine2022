import { Range } from "./helpers";
import * as THREE from "three";
import { Assets } from "./assets";
import { Scene } from "./scene";
import { NumberTween, Tween, TweenMode } from "./tween";


export abstract class GameObject {
  
  model: THREE.Object3D | null = null;
  
  scene: Scene | null = null;
  
  /**
   * Loads a model and stores it in the model attribute
   * @param assets 
   */
  abstract loadModel(assets: Assets): THREE.Object3D;
  
  
  get position(): number {
    if (this.model === null) {
      throw new Error("Game Object model is null so there is no position");
    }
    return this.model.position.z;
  }
  
  set position(value: number) {
    if (this.model === null) {
      throw new Error("Game Object model is null so cannot set position");
    }
    this.model.position.setZ(value);
  }
  
  
  onEnter(scene: Scene): GameObject {
    return this;
  }
  
  onExit(scene: Scene): GameObject {
    this.scene = null;
    return this;
  }
    
  /**
   * Process loop. Delta is time passed in milliseconds
   * @param delta 
   */
  process(delta: number): GameObject {
    return this;
  }
}

export abstract class GameSceneObject extends GameObject {
  // Row number
  private _row: number = 1;
  // The size of the game object.
  // this is measured from the centre of the
  // object outwards
  size: number;
  
  // The floor that this object is on
  floor: number = 0;
  
  // Number of milliseconds for the tween betweem rows
  rowChangeDelay: number = 0;
  
  modelTween: NumberTween = new NumberTween(TweenMode.Linear);
  
  rowTween: NumberTween = new NumberTween(TweenMode.Binary);
  
  constructor(size: number) {
    super();
    this.size = size;
  }
  
  get row(): number {
    return this._row;
  }
  
  set row(value: number) {
    this.setRow(value);
  }
  
  setRow(value: number, callback: () => void = () => {}): void {
    if (this.scene === null) {
      throw new Error('Gamesceneobject has scene as null. Have you added it to the scene yet?')
    }
    const endRow = Math.max(0, Math.min(value, this.scene!.rows - 1));
    const endPosX = endRow * this.scene!.tileWidth;
    if (this.rowChangeDelay === 0) {
      this._row = endRow;
      this.model!.position.x = endPosX;
      callback();
    } else if (!this.rowTween.isTweening && !this.modelTween.isTweening) {
      // If there is actually a row change make a tween
      if (endRow !== this._row) {
        this.rowTween.tween(this._row, endRow, this.rowChangeDelay);
        this.modelTween.tween(this.model!.position.x, endPosX, 
          this.rowChangeDelay, callback);
      } else {
        this._row = endRow;
        this.model!.position.x = endPosX;
        callback();
      }
    }
  } 
  
  get range(): Range {
    return {
      start: this.position - this.size / 2,
      end: this.position + this.size / 2,
    }
  }
  
  override onEnter(scene: Scene): GameObject {
    // Super has to be called first
    const out = super.onEnter(scene);
    this.row = this._row;
    return out;
  }
  
  override process(delta: number): GameObject {
    // Update tweens
    if (this.modelTween.isTweening) {
      this.modelTween.process(delta);
      this.model!.position.x = this.modelTween.getValue();
    }
    if (this.rowTween.isTweening) {
      this.rowTween.process(delta);
      this._row = this.rowTween.getValue();
    }
    return super.process(delta);
  }
}
