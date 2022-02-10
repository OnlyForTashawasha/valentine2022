import * as THREE from "three";
import { Player } from "./player";
import { NumberTween, Tween, TweenMode } from "./tween";

export enum CameraMode {
  Tween,
  Exact,
}

export class GameCamera {
  
  camera: THREE.PerspectiveCamera
  
  // Stores the last xCoordinate
  lastX: number | null = null;
  
  // Stores the last x coordinate where the target was stationary
  lastStationaryX: number | null = null;
  
  // Stores whether the target is currently changing positions
  targetIsMoving: boolean = false;
  
  tween: NumberTween = new NumberTween(TweenMode.Linear);
  
  offset: THREE.Vector3 = new THREE.Vector3(0,0,0);
  
  aheadDistance: number = 0;
  
  mode: CameraMode = CameraMode.Tween;
  
  constructor() {
    // Add camera
    this.camera = new THREE.PerspectiveCamera(75, 
      window.innerWidth / window.innerHeight, 0.1, 500);
  }
  
  private _handleTweenModeProcess(delta: number, player: Player): void {
    const currPx = player.model!.position.x;
    // Initially when x is null set it to current position
    if (this.lastX === null || this.lastStationaryX === null) {
      this.lastX = currPx;
      this.lastStationaryX = currPx;
      this.camera.position.x = currPx;
    }
    
    // Check if stationary or moving
    if (this.lastX !== currPx) {
      if (!this.targetIsMoving) {
        this.targetIsMoving = true;
        this.lastStationaryX = this.lastX;
      }
    } else {
      // Finished moving
      if (this.targetIsMoving && !this.tween.isTweening) {
        // Start a tween when target has finished moving
        this.tween.tween(this.lastStationaryX, currPx, 100);
        this.targetIsMoving = false;
      }
    }
    
    // Update tween
    let xValue = this.camera.position.x;
    if (this.tween.isTweening) {
      // console.log("Process");
      this.tween.process(delta);
      xValue = this.tween.getValue();
      // console.log(xValue);
    }
        
    // Update position
    this.camera.position.copy(new THREE.Vector3(
      xValue,
      player.model!.position.y,
      player.model!.position.z,
    ).add(this.offset));

    // Look ahead of player
    this.camera.lookAt(new THREE.Vector3(
      xValue,
      player.model!.position.y,
      player.model!.position.z + this.aheadDistance,
    ))
    
    // Store last x
    this.lastX = currPx;
  }
  
  private _handleExactModeProcess(delta: number, player: Player): void {
    // Update position
    this.camera.position.copy(new THREE.Vector3(
      player.model!.position.x,
      player.model!.position.y,
      player.model!.position.z,
    ).add(this.offset));

    // Look ahead of player
    this.camera.lookAt(new THREE.Vector3(
      player.model!.position.x,
      player.model!.position.y,
      player.model!.position.z + this.aheadDistance,
    ))
    
    // Store last x
    this.lastX = player.model!.position.x;
  }
  
  /**
   * Updates camera position
   * @param player 
   */
  process(delta: number, player: Player): void {
    switch (this.mode) {
      case CameraMode.Tween:
        this._handleTweenModeProcess(delta, player)
        break;
      case CameraMode.Exact:
        this._handleExactModeProcess(delta, player)
        break;
      default:
        break;
    }
  }
}