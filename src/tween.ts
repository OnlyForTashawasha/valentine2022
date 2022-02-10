import * as THREE from "three";
import { berp, lerp } from "./helpers";

export enum TweenMode {
  Linear,
  Binary,
}

export abstract class Tween {
  isTweening: boolean = false;
  mode: TweenMode;
  // Time elapsed in the tween
  timeElapsed: number = 0;
  // Duration of the tween
  duration: number = 0;
  
  protected _onEndCallback: null | (() => void) = null;
  
  constructor(mode: TweenMode) {
    this.mode = mode;
  }
  
  // Starts a tween
  abstract tween(start: any, end: any, duration: number, callback: () => void): void;
  
  // Gets the value of the tween at the current point in time
  abstract getValue(): any;
  
  process(delta: number): void {
    if (this.isTweening) {
      this.timeElapsed = this.timeElapsed + delta;
      if (this.timeElapsed >= this.duration) {
        this.timeElapsed = this.duration;
        this.isTweening = false;
        // Call callback
        if (this._onEndCallback !== null) {
          this._onEndCallback();
          this._onEndCallback = null;
        }
      }
    }
  }
}

export class NumberTween extends Tween {
  private _start: number= 0;
  private _end: number = 0;
  
  constructor(mode: TweenMode) {
    super(mode);
  }
  
  /**
   * Tweens from a start to end number for a given duration
   * @param start 
   * @param end 
   * @param duration 
   */
  override tween(
    start: number, end: number, duration: number, callback: () => void = () => {}
  ): void {
    this._start = start;
    this._end = end;
    this.duration = duration;
    this.timeElapsed = 0;
    this._onEndCallback = callback;
    this.isTweening = true;
  }
  
  /**
   * Returns the current value of the tween
   */
  override getValue(): number {
    const scale = this.timeElapsed / this.duration;
    // console.log(scale);
    switch (this.mode) {
      case TweenMode.Linear:
        return lerp(this._start, this._end, scale);
      case TweenMode.Binary:
        return berp(this._start, this._end, scale);
      default:
        throw new Error(`Invalid mode ${this.mode}`);
    }
  }
}

export class Vector3Tween extends Tween {
  private _start: THREE.Vector3 = new THREE.Vector3(0,0,0);
  private _end: THREE.Vector3 = new THREE.Vector3(0,0,0);
  
  constructor(mode: TweenMode) {
    super(mode);
  }
  
  /**
   * Tweens from a start to end number for a given duration
   * @param start 
   * @param end 
   * @param duration 
   */
  override tween(
    start: THREE.Vector3, end: THREE.Vector3, duration: number, callback: () => void = () => {}
  ): void {
    this._start = start.clone();
    this._end = end.clone();
    this.duration = duration;
    this.timeElapsed = 0;
    this._onEndCallback = callback;
    this.isTweening = true;
  }
  
  /**
   * Returns the current value of the tween
   */
   override getValue(): THREE.Vector3 {
    const scale = this.timeElapsed / this.duration;
    // console.log(scale);
    switch (this.mode) {
      case TweenMode.Linear:
        return new THREE.Vector3(
          lerp(this._start.x, this._end.x, scale),
          lerp(this._start.y, this._end.y, scale),
          lerp(this._start.z, this._end.z, scale),
        )
      case TweenMode.Binary:
        return new THREE.Vector3(
          berp(this._start.x, this._end.x, scale),
          berp(this._start.y, this._end.y, scale),
          berp(this._start.z, this._end.z, scale),
        )
      default:
        throw new Error(`Invalid mode ${this.mode}`);
    }
  }
}
