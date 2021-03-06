import { CloudGenerator } from "./cloud";
import { Direction, PlayerInput } from "./controller";
import { BattleFloor, Floor } from "./floor";
import { clearUi, createProgress, createHomeUi, setProgress } from "./gameUi";
import { LicoriceMissile, ObstacleGenerator } from "./obstacle";
import { Scene } from "./scene";
import * as THREE from "three";
import { PlayerState } from "./player";
import { Sandwitch, SandwitchState } from "./sandwitch";
import { CameraMode } from "./gameCamera";
import { bossFightDialogue, clearDialogue, createConversation, createDialogue, Dialogue, endingDialogue, introDialogue } from "./dialogue";
import { assetsPath } from "./assetMap";

export abstract class SceneState {
  scene: Scene;
  constructor(scene: Scene) {
    this.scene = scene;
  }
  
  onPlayerInput(input: PlayerInput): void {}
  
  onEnter(): void {}
  
  onExit(): void {}
  
  reset(): void {}
  
  afterReset(): void{}
  
  process(delta: number): void {}
}

export class HomeSceneState extends SceneState {
  override onEnter(): void {
    // Create player scene
    this.scene.player.state = PlayerState.Dance;
    const pPos = this.scene.player.model!.position;
    const threeCamera = this.scene.camera.camera;
    threeCamera.position.copy(pPos.clone().add(new THREE.Vector3(0, 5, 10)));
    threeCamera.lookAt(pPos.clone().add(new THREE.Vector3(0, 2.5, 0)));
    
    // Create ui
    createHomeUi(document.getElementById('ui')!, () => {
      if (window.localStorage.getItem('sandwitchReached') === 'true') {
        this.scene.setState(new BattleGameState(this.scene));
      } else {
        this.scene.setState(new SceneGameState(this.scene))
      }
    });
    
    // Create audio
    this.scene.game.audio.play('dance', true);
  }
  override onExit(): void {
    clearUi(document.getElementById('ui')!);
  }
}

export class BattleGameState extends SceneState {
  // The total time the battle will last for
  battleTimeLength: number = 100000;
  // The time passed
  timePassed: number = 0;
  
  sandwitch: Sandwitch | null = null;
  
  private _inDialogue: boolean = false;
  
  _initScene(): void {
    /**
      Create player
    */
    this.scene.player.state = PlayerState.Idle;
    this.scene.camera.offset = new THREE.Vector3(0,15,-40);
    this.scene.camera.aheadDistance = 500;
    
    /**
     * Create Sandwitch boss
     */
    this.sandwitch = new Sandwitch()
    this.scene.addGameObject(this.sandwitch);
    this.sandwitch.state = SandwitchState.Idle
    this.sandwitch.model!.rotation.y = Math.PI;
    this.sandwitch.model!.position.copy(this.scene.player.model!.position.clone()
      .add(new THREE.Vector3(0,0,200)))
    
    /**
     * Create floor
     */
    const b = new BattleFloor(this.scene.rows, this.scene.tileWidth)
    b.generate(this.scene.player, this.sandwitch, this.scene.scene);
    
    /**
      Update camera mode
    */
    this.scene.camera.mode = CameraMode.Exact;
    /**
      Start boss theme
    */
    this.scene.game.audio.play('bossTheme', true);
    
    this.createConversation([
      {
        name: "SandWitch",
        spriteSrc: `${assetsPath}/sandwitch/serious.png`,
        text: "It's over Doggo!! You will never get the letter back!"
      },
      {
        name: "Mr Borker",
        spriteSrc: `${assetsPath}/mrborker/angry.png`,
        text: "Not if we stop you Sandwitch!!",
      },
    ])
  }
  
  override onEnter(): void {
    this._initScene();
    /**
      Create progress bar
    */
    createProgress(document.getElementById('ui')!, {
      progressColorGradient: 'linear-gradient(45deg, #e64539, #ff5277)',
      textBannerColor: '#4b1d52',
      text: 'Sandwitch',
      textColor: '#e64539',
    })
  }
  
  override onExit(): void {
    clearUi(document.getElementById('ui')!)
  }
  
  override reset(): void {
    this.timePassed = 0;
    super.reset();
  }
  
  override afterReset(): void {
    this._initScene();
  }
  
  override onPlayerInput(input: PlayerInput): void {
    if (input.move !== undefined) {
      this.scene.player.move(input.move)
    }
    if (input.jump) {
      this.scene.player.jump();
    }
  }
  
  async createConversation(dialogues: Array<Dialogue>): Promise<void> {
    this._inDialogue = true;
    this.sandwitch!.paused = true;
    const root = document.getElementById('dialogue-root')!;
    await createConversation(dialogues,
      root,
      this.scene.game.dAudio);
    clearDialogue(root)
    this.sandwitch!.paused = false;
    this._inDialogue = false;
  }
  
  override process(delta: number): void {
    // Update camera
    this.scene.camera.process(delta, this.scene.player);
    // Update time passed and progress bar
    if (this.scene.player.state !== PlayerState.Death && !this._inDialogue) {
      this.timePassed = Math.min(this.timePassed + delta, this.battleTimeLength);
    }
    // Update progress bar
    setProgress(
      Math.min(
        100,
        100 * ((this.battleTimeLength - this.timePassed )/ this.battleTimeLength)
      )
    )
    
    // Check collisions between player an obstacles
    if (this.scene.checkCollision()) {
      this.scene.game.audio.play('death', true);
      this.scene.player.die()
        .then(() => createDialogue({
          text: "Don't give up Tashawasha!! We can beat him!!",
          name: "Mr Borker",
          spriteSrc: `${assetsPath}/mrborker/sad.png`,
          wordTime: 0.15,
        }, document.getElementById('dialogue-root')!,
          this.scene.game.dAudio
        ))
        .then(() => {
          // Decrease health to make game easier
          this.battleTimeLength = Math.max(this.battleTimeLength - 10000, 50000)
          clearDialogue(document.getElementById('dialogue-root')!);
          this.scene.reset()
        })
    }
    
    // Check if battle completed
    if (this.timePassed >= this.battleTimeLength && !this.scene.completed) {
      this.scene.completed = true;
      this.sandwitch!.die()
        .then(() => createConversation(endingDialogue, document.getElementById('dialogue-root')!, this.scene.game.dAudio))
        .then(() => this.scene.game.onGameComplete())
    }
  }
}

export class SceneGameState extends SceneState{
  obstacleGenerator: ObstacleGenerator;
  cloudGenerator: CloudGenerator = new CloudGenerator();
  floor: Floor;
  finished: boolean = false;
  
  // The total length of the game for the player
  // to travel
  gameLength: number = 6000;
  
  constructor(scene: Scene) {
    super(scene);
    this.obstacleGenerator = new ObstacleGenerator(this.gameLength);
    this.floor = new Floor(
      this.scene.rows,
      scene.tileWidth,
      scene.tileLength,
      this.scene.renderDistance
    );
  }
  
  _initScene(): void {
    this.scene.player.state = PlayerState.Moving;
    this.cloudGenerator.generateToLimit(this.scene, this.scene.player.position);
    this.scene.game.audio.play('whatIsLove', true);
  }
  
  override onEnter(): void {
    this._initScene();
    this.scene.camera.offset = new THREE.Vector3(0,15,-20);
    this.scene.camera.aheadDistance = 20;
    // Create game ui
    createProgress(document.getElementById('ui')!, {
      textBannerColor: '#3d2936',
      text: 'Progress',
      textColor: '#f5ffe8'
    })
  }
  
  override onExit(): void {
    clearUi(document.getElementById('ui')!);
  }
  
  override afterReset(): void {
    this._initScene();
  }
  
  override onPlayerInput(input: PlayerInput): void {
    if (input.move !== undefined) {
      this.scene.player.move(input.move)
    }
    if (input.jump) {
      this.scene.player.jump();
    }
  }
  
  override reset(): void {
    // Reset generators
    this.obstacleGenerator.reset();
    this.cloudGenerator.reset();
    this.floor.reset(this.scene.scene);
    super.reset();
  }
  
  override process(delta: number): void {
    // Update camera
    this.scene.camera.process(delta, this.scene.player);
    
    // Update scenery generator
    this.obstacleGenerator.process(delta, this.scene, this.scene.player.position);
    this.cloudGenerator.process(this.scene, this.scene.player.position);
    
    // Update floor
    this.floor.process(this.scene.scene, this.scene.player);
    
    // Update progress bar
    setProgress(
      Math.min(
        100,
        100 * (this.scene.player.position / this.gameLength)
      )
    )
    if (this.scene.player.position >= this.gameLength && !this.finished) {
      this.finished = true;
      this.scene.player.state = PlayerState.Idle;
      this.scene.game.audio.play('dialogueTheme', true);
      // Save to local storage
      window.localStorage.setItem('sandwitchReached', 'true');
      createConversation(
        bossFightDialogue,
        document.getElementById('dialogue-root')!,
        this.scene.game.dAudio
      )
        .then(() => {
          clearDialogue(document.getElementById('dialogue-root')!);
          this.scene.setState(new BattleGameState(this.scene));
        })
      return;
    }
    
    // Check collisions between player an obstacles
    if (this.scene.checkCollision() && !this.finished) {
      this.scene.game.audio.play('death', true);
      this.scene.player.die()
        .then(() => createDialogue({
          text: "Don't give up!! Let's keep going Tashawasha!!",
          name: "Mr Borker",
          spriteSrc: `${assetsPath}/mrborker/sad.png`,
          wordTime: 0.15,
        }, document.getElementById('dialogue-root')!,
          this.scene.game.dAudio
        ))
        .then(() => {
          // Decrease max distance needed to make it easer
          this.gameLength = Math.max(this.gameLength - 500, 2000);
          this.obstacleGenerator.gameLength = this.gameLength;
          clearDialogue(document.getElementById('dialogue-root')!);
          this.scene.reset()
        })
    }
  }
}