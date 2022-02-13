import { GameObject, GameSceneObject } from "./gameObject";
import * as THREE from "three";
import { Assets } from "./assets";
import { Scene } from "./scene";
import { Sandwitch, SandwitchState } from "./sandwitch";

export abstract class Obstacle extends GameSceneObject {
  // The distance at which the obstacle will unload
  unloadDistance: number = 4;

  override onEnter(scene: Scene): GameObject {
    scene.obstacles.add(this);
    return super.onEnter(scene);
  }
  
  override onExit(scene: Scene): GameObject {
    scene.obstacles.delete(this);
    return super.onExit(scene);
  }
  
  override process(delta: number): GameObject {
    // Get distance from player
    if(this.position - this.scene!.player.position < -1 * this.unloadDistance) {
      this.scene!.removeGameObject(this);
    };
    return super.process(delta);
  }
}

export class Cactus extends Obstacle {
  override loadModel(assets: Assets): THREE.Object3D {
    const height = 5 + Math.random() * 15;
    const width = 5 + Math.random() * 5;
    this.model = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, this.size * 2),
      new THREE.MeshLambertMaterial({ color: 0x00ff00 })
    )
    this.model.rotation.y = Math.random() * Math.PI / 2;
    this.model.position.y = height / 2;
    return this.model;
  }
}

export class Boulder extends Obstacle {
  yVelocity: number = 0;
  yGravity: number = 30;
  yInitVelocity: number = 15;
  override loadModel(assets: Assets): THREE.Object3D {
    this.model = new THREE.Mesh(
      new THREE.SphereGeometry(this.size, 10, 10),
      new THREE.MeshLambertMaterial({ color: 0x3b2027 })
    )
    this.model.position.y = this.size;
    return this.model;
  }
  
  override process(delta: number): GameObject {
    const moveSpeed = 70;
    this.model!.position.z -= delta * moveSpeed / 1000;
    
    const origin = this.size;
    
    // Make boulder bounce
    // If currently on ground set initial velocity
    if (this.model!.position.y <= origin) {
      this.yVelocity = this.yInitVelocity;
    }
    // Apply velocity
    this.model!.position.y = Math.max(
      this.model!.position.y + (this.yVelocity * delta / 1000),
      origin
    );
    // Apply gravity
    this.yVelocity -= (this.yGravity * delta / 1000);
    return super.process(delta);
  }
}

export class LicoriceMissile extends Obstacle {
  // stores whether the licorice has landed or not yet
  landed: boolean = false;
  licoriceHeight: number = 10;
  // Distance the licorice spawns from the target
  spawnDist: number = 200;
  // Height of the licorice from the ground
  spawnHeight: number = 100;
  // Number of milliseconds before the missile hits
  landingDelay: number = 2000;
  timePassed: number = 0;
  licoriceModel: THREE.Object3D | null = null;
  alertModel: THREE.Object3D | null = null;
  alertMaterial: Array<THREE.Material> | null = null;
  
  stayOnGroundTime: number = 100;
  
  constructor(size: number) {
    super(size);
    // Cant collide with player right now
    this.floor = -1;
  }
  
  override loadModel(assets: Assets): THREE.Object3D {
    const radialSegments = 8;
    
    // Load licorice model
    this.licoriceModel = new THREE.Mesh(
      new THREE.CylinderGeometry(this.size, this.size, this.licoriceHeight, radialSegments),
      new THREE.MeshLambertMaterial({ color: 0x3a3f5e })
    )
    this.licoriceModel.position.y = this.spawnHeight;
    this.licoriceModel.position.z = this.spawnDist;
    this.licoriceModel.rotation.x = Math.PI / 2 - Math.atan(this.spawnHeight / this.spawnDist);
    
    
    // Load Alert texture
    const texture = assets.cloneTexture('alert');
    texture.magFilter = THREE.NearestFilter;
    texture.center = new THREE.Vector2(0.5,0.5);
    texture.rotation = Math.PI;
    const alertColor = 0xe64539;
    this.alertMaterial = [
      new THREE.MeshBasicMaterial({ color: alertColor }),
      new THREE.MeshBasicMaterial({ color: alertColor }),
      new THREE.MeshBasicMaterial({ color: alertColor }),
      new THREE.MeshBasicMaterial({ color: alertColor }),
      new THREE.MeshBasicMaterial({ map: texture }),
      new THREE.MeshBasicMaterial({ color: alertColor }),
    ]
    
    const factor = 0.7;
    this.alertModel = new THREE.Mesh(
      new THREE.BoxGeometry(
        this.scene!.tileWidth * factor,
        this.scene!.tileWidth * factor,
        1
      ),
      this.alertMaterial
    )
    this.alertModel.rotation.x = -Math.PI / 2;
    this.alertModel.position.z = 20;
    
    // Final model
    this.model = new THREE.Group();
    this.model.add(this.licoriceModel);
    this.model.add(this.alertModel);
    return this.model;
  }
  
  override process(delta: number): GameObject {
    // Change alert opacity
    const changeConstant = 100;
    this.alertMaterial!.map(m => {
      m.opacity = 0.75 + Math.cos(this.timePassed / changeConstant) * 0.25;
    })
    
    // Change licorice position
    this.licoriceModel!.position.y = Math.max(
      this.spawnHeight
        - ((this.timePassed / this.landingDelay) * this.spawnHeight),
      this.licoriceHeight / 2  
    );
    this.licoriceModel!.position.z = Math.max(
      this.spawnDist
        - ((this.timePassed / this.landingDelay) * this.spawnDist),
      0  
    );
    
    // Check if landed
    this.landed = this.timePassed >= this.landingDelay
    
    // Set the z position always to equal the players position
    if (!this.landed) {
      this.position = this.scene!.player.position;
    } else {
      this.floor = 0;
      this.alertModel!.visible = false;
    }
    
    this.timePassed += delta;
    const out =  super.process(delta);
    if (this.timePassed - this.landingDelay >= this.stayOnGroundTime) {
      this.scene?.removeGameObject(this);
    }
    return out;
  }
}

export class ObstacleGenerator {
  // The minimum distance before obstacles can spawn again
  spawnMinDist: number = 10;
  // The maximum distance that guarantees a spawn
  spawnMaxDist: number = 100;
  
  // The rate at which the spawn max dist decreases
  decreaseRate: number = 1;
  
  // The position where the next obstacle is to spawn
  nextSpawnPos: number | null = null;
  
  // Distance ahead of player to spawn
  spawnAhead: number = 300;
  
  boulderSpawnRate: number = 0.005
  
  gameLength: number;
  
  private _hasSpawnSandwitch: boolean = false
  
  constructor(gameLength: number) {
    this.gameLength = gameLength;
  }
  
  reset(): void {
    this.spawnMaxDist = 100;
    this.boulderSpawnRate = 0.005
    this.nextSpawnPos = null;
  }
  
  spawn(scene: Scene, position: number) {
    const roll = Math.random();
    let obstacle = null;
    if (roll < this.boulderSpawnRate) {
      obstacle = new Cactus(3);
    } else {
      obstacle = new Cactus(3);
    }
    scene.addGameObject(obstacle)
    obstacle.position = position;
    obstacle.row = Math.floor(Math.random() * scene.rows);
  }
  
  process(delta: number, scene: Scene, playerPos: number) {
    this.boulderSpawnRate = Math.min(0.15, this.boulderSpawnRate + (0.0001 * delta / 1000));
    this.spawnMaxDist = Math.max(30, this.spawnMaxDist - (this.decreaseRate * delta / 1000));
    
    // Generate the next spawn position
    if (this.nextSpawnPos === null) {
      // Create the new obstacle
      this.nextSpawnPos = (playerPos + this.spawnAhead +
        this.spawnMinDist + Math.random() * (this.spawnMaxDist - this.spawnMinDist)
      )
    } else {
      // If destination reached spawn an obstacle
      if (playerPos + this.spawnAhead >= this.nextSpawnPos) {
        if (this.nextSpawnPos >= this.gameLength) {
          console.log(this._hasSpawnSandwitch);
          if (!this._hasSpawnSandwitch) {
            /**
             * Create Sandwitch boss
             */
            const sandwitch = new Sandwitch()
            scene.addGameObject(sandwitch);
            sandwitch.state = SandwitchState.Idle
            sandwitch.paused = true;
            sandwitch.model!.rotation.y = Math.PI;
            sandwitch.position = this.nextSpawnPos + 5;
            sandwitch.model!.scale.setScalar(0.1);
            this._hasSpawnSandwitch = true;
          }
        } else {
          this.spawn(scene, this.nextSpawnPos);
          this.nextSpawnPos = null;
        }
      }
    }
  }
}