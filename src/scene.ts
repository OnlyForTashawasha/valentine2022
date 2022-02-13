import { Obstacle, ObstacleGenerator } from "./obstacle";
import { Player, PlayerState } from "./player";
import * as THREE from "three";
import { GameObject } from "./gameObject";
import { Assets } from "./assets";
import { GameCamera } from "./gameCamera";
import { Floor } from "./floor";
import { CloudGenerator } from "./cloud";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";
import { setProgress } from "./gameUi";
import { Game } from "./game";
import { BattleGameState, HomeSceneState, SceneGameState, SceneState } from "./sceneState";
import { PlayerInput } from "./controller";


/***
  TODO: Refactor the scene into different game states
  A state for playing the main game
  A state for the home screen
*/

export class Scene {

  player: Player;
  obstacles: Set<Obstacle> = new Set();
  
  private _gameObjects: Set<GameObject> = new Set();
  
  rows: number = 3;
  scene: THREE.Scene = new THREE.Scene();
  // Set camera
  camera: GameCamera = new GameCamera();
  // Make renderer
  renderer: THREE.WebGL1Renderer = new THREE.WebGL1Renderer({
    alpha: true
  });
  
  assets: Assets;
  
  renderDistance: number = 500;
  
  outlinePass: OutlinePass;
  
  // The default tilesizes for scenes
  tileWidth: number = 20;
  tileLength: number = 30;
  
  /**
    Responsible for adding post processing steps like outlines
  */
  effectComposer: EffectComposer;
  
  // Called when the game ends
  game: Game;
  
  // This is set to true when th3e player dies or when
  // the player wins
  completed: boolean = false
  
  private _state: SceneState;
  
  constructor(assets: Assets, game: Game) {
    this.assets = assets;
    
    this.game = game;
    
    // Set the renderer size the first time
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // Enable shadows
    this.renderer.shadowMap.enabled = true;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    // Initialise effect composer
    this.effectComposer = new EffectComposer(this.renderer);
    this.effectComposer.addPass(new RenderPass(this.scene, this.camera.camera));
    
    /**
     * Make outline pass
     */
    this.outlinePass = new OutlinePass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      this.scene,
      this.camera.camera
    );
    this.outlinePass.edgeGlow = 1;
    this.outlinePass.visibleEdgeColor.set(0xffffff)
    this.effectComposer.addPass(this.outlinePass);
    
    // Create fog
	  this.scene.fog = new THREE.Fog(0xf7d9aa, 100, 3 * this.renderDistance / 4);
    
    // Lights
    const light1 = new THREE.DirectionalLight( 0xffffff, 0.9 ); // soft white light
    light1.castShadow = true;
    light1.position.set(-10, 50, -30);
    this.scene.add( light1 );
    
    const light2 = new THREE.HemisphereLight( 0x92e8c0, 0x1b1f21, 0.5 ); // soft white light
    this.scene.add( light2 );
    
    // Add player
    this.player = new Player();
    this.addGameObject(this.player);
    
    // Add starting scene
    this._state = new HomeSceneState(this);
    this._state.onEnter();
  }
  
  get domElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }
  
  onPlayerInput(input: PlayerInput): void {
    this._state.onPlayerInput(input);
  }
  
  setState(state: SceneState): void {
    this._state.onExit();
    this.reset();
    this._state = state;
    this._state.onEnter();
  }
  
  /**
   * Resets the game state
   */
  reset(): void {
    this._state.reset();
    // Remove all game objects
    for(const gO of this._gameObjects.values()) {
      this.removeGameObject(gO);
    }
    // Add new player
    this.player = new Player();
    this.addGameObject(this.player);
    this._state.afterReset();
  }
  
  /**
   * Called when totally destroying the scene
   */
  destroy(): void {}
  
  addGameObject(o: GameObject): void {
    this._gameObjects.add(o);
    o.scene = this;
    // Load model
    o.loadModel(this.assets);
    // Add model to threejs scene
    if (o.model === null) {
      throw new Error(`Gameobject does not have model`);
    }
    // Add model
    this.scene.add(o.model);
    o.onEnter(this);
  }
  
  removeGameObject(o: GameObject): boolean {
    if (o.model !== null) {
      this.scene.remove(o.model);
    }
    o.onExit(this);
    return this._gameObjects.delete(o);
  }
  
  checkCollision(): boolean {
    // Check collisions between player an obstacles
    for (const o of this.obstacles.values()) {
      if (
        o.row === this.player.row &&
        o.range.start <= this.player.range.end &&
        this.player.range.start <= o.range.end &&
        this.player.floor === o.floor &&
        this.player.state !== PlayerState.Death &&
        !this.completed
      ) {
        return true;
      }
    }
    return false
  }
  
  /**
   * Process loop. Delta is time passed in milliseconds
   * @param delta 
   */
  process(delta: number): void {
    // Process game objects
    for (const g of this._gameObjects.values()) {
      g.process(delta);
    }
    // Let the state process 
    this._state.process(delta);
    // Render THREEJS Scene
    this.effectComposer.render();
  }
}