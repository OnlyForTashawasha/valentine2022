import * as THREE from "three";
import { Scene } from "three";
import { GameObject } from "./gameObject";
import { Player } from "./player";

export class Floor {
  renderDistance: number;
  rows: number;
  tileLength: number;
  tileWidth: number;
  // Stores all the planes loaded as the floor currently
  tiles: Set<THREE.Object3D> = new Set();
  constructor (rows: number, tileWidth: number, tileLength: number, renderDistance: number) {
    this.rows = rows;
    this.tileWidth = tileWidth;
    this.tileLength = tileLength;
    this.renderDistance = renderDistance;
  }
  
  reset(scene: THREE.Scene): void {
    for (const tile of this.tiles.values()) {
      scene.remove(tile);
      this.tiles.delete(tile);
    }
  }
  
  process(scene: THREE.Scene, player: Player): void {
    // Stores the distance of the plane that is the furthest forward
    let furthestForward = 0;
    // Loop through each of the planes
    // And unload all the planes that are too far from the player
    for (const t of this.tiles) {
      const dist = t.position.z - player.position;
      // Store into furthest forward if the msot ahead one
      furthestForward = dist > furthestForward ? dist : furthestForward;
      // Check if the plane is outside render distance
      if (dist < -0.1 * this.renderDistance) {
        this.tiles.delete(t);
        scene.remove(t);
      }
    }
    // Load a new plane ahead if necessary
    while (furthestForward < this.renderDistance) {
      // Add a new row of tiles
      for (let i = 0; i < this.rows; i++) {
        const tile = new THREE.Mesh(
          new THREE.PlaneGeometry(this.tileWidth, this.tileLength),
          new THREE.MeshLambertMaterial( {
            color: 0xffae70
          } )
        )
        tile.position.x = i * this.tileWidth;
        tile.position.z = player.position + furthestForward + this.tileLength;
        tile.rotation.x = -Math.PI / 2;
        
        // Add to tile set and scene
        this.tiles.add(tile);
        scene.add(tile);
      }
      // Increase tile length as a new row has been added
      furthestForward += this.tileLength;
    }
  }
}

export class BattleFloor {
  rows: number;
  tileWidth: number;
  /* The padding at the end and start of the rows */
  padding: number = 200;
  constructor (rows: number, tileWidth: number) {
    this.rows = rows;
    this.tileWidth = tileWidth;
  }
  
  /**
   * Generates the floor between the player and the enemy
   * @param player 
   * @param enemy 
   */
  generate(player: Player, enemy: GameObject, scene: Scene): void {
    const dist = player.model!.position.distanceTo(enemy.model!.position);
    for (let i = 0; i < this.rows; i++) {
      const row = new THREE.Mesh(
        new THREE.PlaneGeometry(this.tileWidth, dist + 2 * this.padding),
        new THREE.MeshLambertMaterial( {
          color: 0xffae70
        } )
      )
      row.position.x = i * this.tileWidth;
      row.position.z = player.position + dist / 2;
      row.rotation.x = -Math.PI / 2;
      
      // Add to tile set and scene
      scene.add(row);
    }
  }
}