import { GameSceneObject, GameObject } from "./gameObject";
import * as THREE from "three";
import { Assets } from "./assets";
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { Scene } from "./scene";
import { Direction } from "./controller";
import { AnimationAction, AnimationClip } from "three";
import { Entity } from "./entity";

export enum PlayerState {
  Moving,
  Idle,
  Airborne,
  Happy,
  MovingRight,
  MovingLeft,
  Death,
}

export class Player extends Entity<PlayerState> {
  // The distance that the player will travel per second
  speed: number = 50;
  
  _airborneTotalTime: number = 1;
  _airborneTimeElapsed: number = 0;
  _airborneMaxHeight: number = 25;
  // Stores the last state before a jump
  _previousJumpState: PlayerState = PlayerState.Moving;
  // Dont set this manually, this is calculated when entering
  // the jump state
  _initVelocity: number = 0;
  _gravity: number = 0;
  
  constructor() {
    super(1, PlayerState.Idle);
    this.rowChangeDelay = 200;
    this._onStateEnter();
  }
  
  // Called when entering a new state
  override _onStateEnter(): void {
    switch (this.state) {
      case PlayerState.Moving:
        this._playAnim('playerRunAnim', {  timeScale: 1.3 });
        break;
      case PlayerState.Idle:
        this._playAnim('playerIdleAnim');
        break;
      case PlayerState.Airborne:
        this._playAnim('playerAirborneAnim');
        break;
      case PlayerState.Happy:
        this._playAnim('playerHappyAnim');
        break;
      case PlayerState.MovingRight:
        this._playAnim('playerMoveRightAnim');
        break;
      case PlayerState.MovingLeft:
        this._playAnim('playerMoveLeftAnim');
        break;
      case PlayerState.Death:
        this._playAnim('playerDeathAnim', { once: true });
        break;
      default:
        break;
    }
  }
  
  die(): Promise<void> {
    return new Promise((resolve, _) => {
      this.state = PlayerState.Death;
      const onAnimFinish = () => {
        this.mixer!.removeEventListener('finished', onAnimFinish);
        resolve();
      }
      this.mixer!.addEventListener('finished', onAnimFinish);
    })
  }
  
  jump(): void {
    if (this.state === PlayerState.Moving || this.state === PlayerState.Idle) {
      this._previousJumpState = this.state;
      this.state = PlayerState.Airborne;
      this._airborneTimeElapsed = 0;
      /**
        The init velocity and gravity is calculated from kinematic equations
      */
      this._initVelocity = 4 * this._airborneMaxHeight / this._airborneTotalTime;
      this._gravity = 8 * this._airborneMaxHeight / Math.pow(this._airborneTotalTime, 2);
    }
  }
  
  /**
   *  Moves the player row
   * @param toRight - Moves to right if true else to left
   */
  move(direction: Direction): void {
    if (this.state === PlayerState.Moving) {
      if (direction === Direction.Right) {
        this.row -= 1;
      } else {
        this.row += 1;
      }
    } else if (this.state === PlayerState.Idle) {
      const callback = () => {
        this.state = PlayerState.Idle;
      }
      if (direction === Direction.Right) {
        this.state = PlayerState.MovingRight;
        this.setRow(this.row - 1, callback);
      } else {
        this.state = PlayerState.MovingLeft;
        this.setRow(this.row + 1, callback);
      } 
    }
  }
  
  override onEnter(scene: Scene): GameObject {
    const out = super.onEnter(scene);
    scene.outlinePass.selectedObjects.push(this.model!);
    return out;
  }
  
  override onExit(scene: Scene): GameObject {
    const index = scene.outlinePass.selectedObjects.indexOf(this.model!);
    if (index !== -1) {
      scene.outlinePass.selectedObjects.splice(index, 1);
    }
    return super.onExit(scene);
  }
  
  override loadModel(assets: Assets): THREE.Object3D {
    const group = new THREE.Group();
    // Load model
    const charFbx = assets.cloneModel('mrborker');
    
    // Change material
    charFbx.traverse((child: any) => {
      if (child.isMesh) {
        const oldMaterial = child.material;
        child.material = new THREE.MeshToonMaterial({
          map: oldMaterial.map,
          color: oldMaterial.color
        })
      }
    })
    
    charFbx.scale.setScalar(0.01);
    // Load animation
    this.mixer = new THREE.AnimationMixer(charFbx);
    
    // Store assets
    this.assets = assets;
    
    group.add(charFbx);
          
    // // Add a box underneath to display hit box
    // group.add(new THREE.Mesh(
    //   new THREE.BoxGeometry(4, 2, this.size * 2),
    //   new THREE.MeshBasicMaterial({ color: 0x000000 })
    // ))
    
    // Store into model
    this.model = group;

    return group;
  }
  
  override process(delta: number): GameObject {
    switch (this.state) {
      case PlayerState.Moving:
        // Increase distance by player speed
        this.position += this.speed * (delta / 1000);
        break;
      case PlayerState.Idle:
        break;
      case PlayerState.Airborne:
        // Increase distance by player speed
        if (this._previousJumpState === PlayerState.Moving) {
          this.position += this.speed * (delta / 1000);
        }
        /**
         * Position of the player is solved based on the kinematic equations
         */
        this.model!.position.y = 
          (this._initVelocity * this._airborneTimeElapsed) -
          (this._gravity * Math.pow(this._airborneTimeElapsed, 2) / 2)
        this._airborneTimeElapsed += (delta / 1000);
        if (this._airborneTimeElapsed >= this._airborneTotalTime) {
          this.model!.position.y = 0;
          this.state = this._previousJumpState;
        }
        
        // Set the correct floor level
        if (
          this._airborneTimeElapsed > this._airborneTotalTime / 4 &&
          this._airborneTimeElapsed < 5 * this._airborneTotalTime / 6
        ) {
          this.floor = 1;
        } else {
          this.floor = 0;
        }
        
        break;
      default:
        break;
    }
    // Update animation
    if (this.mixer !== null) {
      // Delta is in seconds for THREEJS Mixer
      this.mixer.update(delta / 1000)
    }
    return super.process(delta);
  }
}