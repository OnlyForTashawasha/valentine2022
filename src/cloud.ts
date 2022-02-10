import * as THREE from "three";
import { Assets } from "./assets";
import { GameObject } from "./gameObject";
import { Scene } from "./scene";

export class Cloud extends GameObject{
  unloadDistance: number = 4;
  /**
   * Randomly generated cloud taken from here:
   * https://tympanus.net/codrops/2016/04/26/the-aviator-animating-basic-3d-scene-threejs/
   */
  constructor () {
    super();
  }
  
  /**
   * Randomly generated cloud taken from here:
   * https://tympanus.net/codrops/2016/04/26/the-aviator-animating-basic-3d-scene-threejs/
   */
  override loadModel(assets: Assets): THREE.Object3D {
    // Create an empty container that will hold the different parts of the cloud
  	this.model = new THREE.Object3D();
  	
  	// create a cube geometry;
  	// this shape will be duplicated to create the cloud
  	const geom = new THREE.BoxGeometry(20,20,20);
  	
  	// create a material; a simple white material will do the trick
  	const mat = new THREE.MeshPhongMaterial({
  		color: 0xf5ffe8,  
  	});
  	
  	// duplicate the geometry a random number of times
  	const nBlocs = 3+Math.floor(Math.random()*3);
  	for (let i=0; i<nBlocs; i++ ){
  		
  		// create the mesh by cloning the geometry
  		const m = new THREE.Mesh(geom, mat); 
  		
  		// set the position and the rotation of each cube randomly
  		m.position.x = i*15;
  		m.position.y = Math.random()*10;
  		m.position.z = Math.random()*10;
  		m.rotation.z = Math.random()*Math.PI*2;
  		m.rotation.y = Math.random()*Math.PI*2;
  		
  		// set the size of the cube randomly
  		const s = .1 + Math.random()*.9;
  		m.scale.set(s,s,s);
  		
  		// allow each cube to cast and to receive shadows
  		m.castShadow = true;
  		m.receiveShadow = true;
  		
  		// add the cube to the container we first created
  		this.model.add(m);
  	} 
  	return this.model;
  }
  
  override process(delta: number): GameObject {
    // Get distance from player
    if(this.position - this.scene!.player.position < -1 * this.unloadDistance) {
      this.scene!.removeGameObject(this);
    };
    return super.process(delta);
  }
}

export class CloudGenerator {
  // The minimum distance before clouds can spawn again
  spawnMinDist: number = 50;
  // The maximum distance that guarantees a spawn
  spawnMaxDist: number = 200;
  
  // The position where the next cloud is to spawn
  nextSpawnPos: number | null = null;
  
  // Distance ahead of player to spawn
  spawnAhead: number = 700;
  
  reset(): void {
    this.nextSpawnPos = null;
  }
  
  spawn(scene: Scene, position: number) {
    const cloud = new Cloud()
    scene.addGameObject(cloud)
    cloud.position = position;
    const widthRange = 300;
    cloud.model!.position.setX(Math.random() * widthRange - widthRange / 2);
    const heightRange = 50;
    const minHeight = 40;
    cloud.model!.position.setY(Math.random() * heightRange + minHeight);
  }
  
  generateToLimit(scene: Scene, playerPos: number): void {
    let currPos = playerPos;
    const limit = playerPos + this.spawnAhead;
    while(currPos < limit) {
      this.spawn(scene, currPos);
      currPos += this.spawnMinDist + Math.random() * (this.spawnMaxDist - this.spawnMinDist)
    }
  }
  
  process(scene: Scene, playerPos: number): void {
    // Generate the next spawn position
    if (this.nextSpawnPos === null) {
      // Create the new obstacle
      this.nextSpawnPos = (playerPos + this.spawnAhead +
        this.spawnMinDist + Math.random() * (this.spawnMaxDist - this.spawnMinDist))
    } else {
      // If destination reached spawn an obstacle
      if (playerPos + this.spawnAhead >= this.nextSpawnPos) {
        this.spawn(scene, this.nextSpawnPos);
        this.nextSpawnPos = null;
      }
    }
  }
}