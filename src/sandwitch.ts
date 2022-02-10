import { Object3D, Event } from "three";
import { Assets } from "./assets";
import { GameObject } from "./gameObject";
import * as THREE from "three";
import { Boulder, LicoriceMissile } from "./obstacle";
import { Scene } from "./scene";
import { Entity } from "./entity";

export enum SandwitchState {
  Idle,
  JumpAttack,
  Laugh,
  Throw,
}

export class Sandwitch extends Entity<SandwitchState> {
  
  // The time left till the next attack
  private _nextAttackTimeLeft = 0;
  // The cooldown between each attack
  private _attackCooldown = 1000;
  
  private _currAttack: SandwitchAttack | null = null;
  
  constructor() {
    super(1, SandwitchState.Idle);
  }
  
  override onEnter(scene: Scene): GameObject {
    const s = super.onEnter(scene);
    return s;
  }
  
  attack(): Promise<void> {
    const attacks = [
      new BoulderAttack(this),
      new JumpAttack(this),
      new MissileAttack(this),
    ]
    this._currAttack = attacks[Math.floor(Math.random() * attacks.length)];
    return this._currAttack.start();
  }  
  
  override _onStateEnter(): void {
    switch (this.state) {
      case SandwitchState.Idle:
        this._playAnim('sandwitchIdleAnim');
        break;
      case SandwitchState.JumpAttack:
        this._playAnim('sandwitchJumpAttackAnim', { once: true });
        break;
      case SandwitchState.Laugh:
        this._playAnim('sandwitchLaughAnim', { once: true });
        break;
      case SandwitchState.Throw:
        this._playAnim('sandwitchThrowAnim', { once: true });
        break;
      default:
        break;
    }
  }
  
  override loadModel(assets: Assets): Object3D {
    const group = new THREE.Group();
    // Load model
    const charFbx = assets.cloneModel('sandwitch');
    
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
    
    charFbx.scale.setScalar(0.35);
    // Load animation
    this.mixer = new THREE.AnimationMixer(charFbx);
    
    // Store assets
    this.assets = assets;
    
    group.add(charFbx);
    
    // Store into model
    this.model = group;

    return group;
  }
  
  override process(delta: number): GameObject {
    // Update attack
    this._currAttack?.process(delta);
    
    // See if a new attack is needed
    this._nextAttackTimeLeft -= delta;
    if (this._nextAttackTimeLeft <= 0 && this._currAttack === null) {
      this.attack().then(() => {
        this._currAttack = null;
        this._nextAttackTimeLeft = this._attackCooldown;
      })
    }
    // Update animation
    if (this.mixer !== null) {
      // Delta is in seconds for THREEJS Mixer
      this.mixer.update(delta / 1000)
    }
    return super.process(delta);
  }
}

// export type SandwitchAttack = (s: Sandwitch) => Promise<void>;

export abstract class SandwitchAttack {
  protected _sandwitch: Sandwitch;
  constructor (s: Sandwitch) {
    this._sandwitch = s;
  }
  
  abstract start(): Promise<void>;
  
  process(delta: number): void {}
}

export class BoulderAttack extends SandwitchAttack {
  private _boulderNumRows: number = 5;
  private _boulderDelay: number = 500;
  private _timePassed: number = 1000;
  private _finishEventTarget: EventTarget = new EventTarget();
  private _finishAnim: boolean = false;
  
  override start(): Promise<void> {
    return new Promise((resolve, _) => {
      this._sandwitch.state = SandwitchState.Throw;
      /**
       * NOTE: We must put the listener after the state change
       * as the animation only changes when there is a state change
       */
      const onAnimFinish = () => {
        this._sandwitch.mixer!.removeEventListener('finished', onAnimFinish);
        this._finishAnim = true;
        this._sandwitch.state = SandwitchState.Idle;
        // Wait for all boulders to be finished
        const onFinish = () => {
          this._finishEventTarget.removeEventListener('finished', onFinish);
          resolve();
        }
        this._finishEventTarget.addEventListener('finished', onFinish);
      }
      this._sandwitch.mixer!.addEventListener('finished', onAnimFinish);
    })
  }
  
  override process(delta: number): void {
    if (this._finishAnim) {
      // Check if all missiles are fired
      if (this._boulderNumRows === 0) {
        this._finishEventTarget.dispatchEvent(new Event('finished'));
      }
      
      // Check if it is time to fire another missile
      if (this._timePassed >= this._boulderDelay) {
        // Throws the Boulder
        const b = new Boulder(4);
        this._sandwitch.scene!.addGameObject(b);
        b.row = Math.floor(Math.random() * this._sandwitch.scene!.rows);
        b.position = this._sandwitch.position - 80;
        this._timePassed = 0;
        this._boulderNumRows -= 1; 
      }
      this._timePassed += delta;
    }
  }
}

export class JumpAttack extends SandwitchAttack {
  private _boulderNumRows: number = 5;
  private _boulderDelay: number = 1000;
  private _timePassed: number = 1000;
  private _finishEventTarget: EventTarget = new EventTarget();
  private _finishAnim: boolean = false;
  
  override start(): Promise<void> {
    return new Promise((resolve, _) => {
      this._sandwitch.state = SandwitchState.JumpAttack;
      /**
       * NOTE: We must put the listener after the state change
       * as the animation only changes when there is a state change
       */
      const onAnimFinish = () => {
        this._sandwitch.mixer!.removeEventListener('finished', onAnimFinish);
        this._finishAnim = true;
        this._sandwitch.state = SandwitchState.Idle;
        // Wait for all boulders to be finished
        const onFinish = () => {
          this._finishEventTarget.removeEventListener('finished', onFinish);
          resolve();
        }
        this._finishEventTarget.addEventListener('finished', onFinish);
      }
      this._sandwitch.mixer!.addEventListener('finished', onAnimFinish);
    })
  }
  
  override process(delta: number): void {
    if (this._finishAnim) {
      // Check if all missiles are fired
      if (this._boulderNumRows === 0) {
        this._finishEventTarget.dispatchEvent(new Event('finished'));
      }
      
      // Check if it is time to fire another missile
      if (this._timePassed >= this._boulderDelay) {
        const ignoreRow = Math.floor(Math.random() * this._sandwitch.scene!.rows);
        for (let rowIndex = 0; rowIndex < this._sandwitch.scene!.rows; rowIndex++) {
          if (rowIndex !== ignoreRow) {
            // Throws the Boulder
            const b = new Boulder(4);
            this._sandwitch.scene!.addGameObject(b);
            b.row = rowIndex;
            b.position = this._sandwitch.position - 80;
            this._timePassed = 0;
          }
        }
        this._boulderNumRows -= 1; 
      }
      this._timePassed += delta;
    }
  }
}

export class MissileAttack extends SandwitchAttack {
  private _missileRows: Array<number> = [];
  private _missileDelay: number = 750;
  private _timePassed: number = 0;
  private _finishEventTarget: EventTarget = new EventTarget();
  
  constructor(s: Sandwitch) {
    super(s);
    for (let i = 0; i < this._sandwitch.scene!.rows; i++) {
      this._missileRows.push(i);
    }
  }
  
  override start(): Promise<void> {
    return new Promise((resolve, _) => {
      this._sandwitch.state = SandwitchState.Laugh;
      /**
       * NOTE: We must put the listener after the state change
       * as the animation only changes when there is a state change
       */
      const onFinish = () => {
        this._sandwitch.state = SandwitchState.Idle;
        this._finishEventTarget.removeEventListener('finished', onFinish);
        resolve();
      }
      this._finishEventTarget.addEventListener('finished', onFinish);
    }) 
  }
  
  override process(delta: number): void {
    // Check if all missiles are fired
    if (this._missileRows.length === 0) {
      this._finishEventTarget.dispatchEvent(new Event('finished'));
    }
    
    // Check if it is time to fire another missile
    if (this._timePassed >= this._missileDelay) {
      const nextIndex = Math.floor(Math.random() * this._missileRows.length);
      // Summon a missile
      const missile = new LicoriceMissile(3);
      this._sandwitch.scene!.addGameObject(missile);
      missile.row = this._missileRows[nextIndex];
      this._missileRows.splice(nextIndex, 1);
      this._timePassed = 0;
    }
    this._timePassed += delta;
  }
}