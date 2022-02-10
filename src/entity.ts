import * as THREE from "three";
import { Assets } from "./assets";
import { GameSceneObject } from "./gameObject";



export abstract class Entity<EntityState> extends GameSceneObject {
  // Stores the state of the entity
  private _state: EntityState
  
  mixer: THREE.AnimationMixer | null = null;
  
  assets: Assets | null = null;
  
  // Maps the animation name to the action
  private _animMap: Map<string, THREE.AnimationAction> = new Map();
  // Name of the last animation played
  private _lastAnim: string | null = null;
  
  constructor(size: number, initState: EntityState) {
    super(size);
    this._state = initState;
  }
  
  get state(): EntityState {
    return this._state;
  }
  
  set state(value: EntityState) {
    this._onStateExit(this._state);  
    this._state = value;
    this._onStateEnter(this._state);  
  }
  
  protected _onStateEnter(enterState: EntityState): void {}
  
  protected _onStateExit(exitState: EntityState): void {}
  
  protected _playAnim(name: string, options: {
      timeScale?: number,
      fadeOutDuration?: number,
      once?: boolean,
    } = {}
  ): void {
    if (this.assets !== null && this.mixer !== null) {
      // Get the stored action
      let action = this._animMap.get(name);
      if (action === undefined) {
        const anim = this.assets.cloneAnimation(name);
        action = this.mixer.clipAction(anim.animations[0]);
        // Store action in map
        this._animMap.set(name, action);
      }
      
      // Set to once if needed
      if (options.once || false) {
        action.loop = THREE.LoopOnce;
        action.clampWhenFinished = true;
        action.enabled = true;
      } else {
        action.loop = THREE.LoopRepeat;
        action.clampWhenFinished = false;
        action.enabled = true;
      }
      
      // Phase out the previous action
      if (this._lastAnim !== null && name !== this._lastAnim) {
        this._animMap.get(this._lastAnim)!.fadeOut(
          options.fadeOutDuration || 0.5
        );
      }
      // Change to new action
      this._lastAnim = name;
      action
				.reset()
				.setEffectiveTimeScale( options.timeScale || 1 )
				.setEffectiveWeight( 1 )
				.fadeIn( options.fadeOutDuration || 0.5 )
				.play();
    }
  }
}