import { Group, Texture, TextureLoader } from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils"
import { AssetMap } from "./assetMap";
import { createHTMLElement } from "./helpers";


export class Assets  {
  private models: { [key: string]: Group } = {};
  private animations: { [key: string]: Group } = {};
  private textures: { [key: string]: Texture } = {};
  private audio: { [key: string]: HTMLAudioElement } = {};
  
  addModel(name: string, group: Group): void {
    this.models[name] = group;
  }
  
  addAnimation(name: string, group: Group): void {
    this.animations[name] = group;
  }
  
  addTexture(name: string, texture: Texture): void {
    this.textures[name] = texture;
  }
  
  addAudio(name: string, audio: HTMLAudioElement): void {
    this.audio[name] = audio;
  }
  
  getAudio(name: string): HTMLAudioElement | null {
    if (name in this.audio) {
      return this.audio[name];
    }
    return null;
  }
  
  cloneModel(name: string): Group {
    if (!(name in this.models)) {
      throw new Error(`Model with name ${name} doesnt exist`);
    }
    return (SkeletonUtils as any).clone(this.models[name]);
  }
  
  cloneAnimation(name: string): Group {
    if (!(name in this.animations)) {
      throw new Error(`Animation with name ${name} doesnt exist`);
    }
    return this.animations[name];
  }

  cloneTexture(name: string): Texture {
    if (!(name in this.textures)) {
      throw new Error(`Texture with name ${name} doesnt exist`);
    }
    // Return the group cloned
    return this.textures[name];
  }
}

export type ProgressCallback = (percent: number) => void;

export class AssetLoader {
  // Number of assets loaded
  loadedNum: number = 0;
  /**
   * 
   * @param assetPaths - given an array of asset paths, load them
   */
  async load(assetMap: AssetMap,
    progress: ProgressCallback = (p) => {}): Promise<Assets>
  {
    const assets = new Assets();
    // Get total length of assets
    const assetLength: number = Object.keys(assetMap).reduce(
      (s, n) => s + Object.keys((assetMap as any)[n]).length,
      0
    );
    
    // Loads a group
    const loadGroup = async (name: string, path: string): Promise<Group> => {
      const fileType = path.split('.').pop();
      // Find the correct file type
      if (fileType === 'fbx') {
        const loader = new FBXLoader();
        // Wait for asset to be loaded
        const asset = await loader.loadAsync(path);
        this.loadedNum++;
        const percentage = this.loadedNum / assetLength;
        // Call callback
        progress(percentage);
        return asset;
      } else if (fileType === 'glb') {
        const loader = new GLTFLoader();
        // Wait for asset to be loaded
        const asset = (await loader.loadAsync(path)).scene;
        this.loadedNum++;
        const percentage = this.loadedNum / assetLength;
        // Call callback
        progress(percentage);
        return asset;
      }
      throw new Error(`Asset ${name} at ${path} has invalid file type`);
    }
    
    // Loads a texture
    const loadTexture = async (name: string, path: string): Promise<Texture> => {
      const fileType = path.split('.').pop();
      if (fileType === 'jpg' || fileType === 'png') {
        const loader = new TextureLoader();
        // Wait for asset to be loaded
        const texture = await loader.loadAsync(path);
        this.loadedNum++;
        const percentage = this.loadedNum / assetLength;
        // Call callback
        progress(percentage);
        return texture;
      }
      throw new Error(`Asset ${name} at ${path} has invalid file type`);
    }
    
    // Load models
    await Promise.all(
      Object.keys(assetMap.models).map(async name => {
        const asset = await loadGroup(name, assetMap.models[name])
        assets.addModel(name, asset);
      })
    )
    
    // Load animations
    await Promise.all(
      Object.keys(assetMap.animations).map(async name => {
        const asset = await loadGroup(name, assetMap.animations[name])
        assets.addAnimation(name, asset);
      })
    )
        
    // Load textures
    await Promise.all(
      Object.keys(assetMap.textures).map(async name => {
        const asset = await loadTexture(name, assetMap.textures[name])
        assets.addTexture(name, asset);
      })
    )
    
    // Load images
    await Promise.all(
      assetMap.images.map(src => {
        const imgElem = createHTMLElement('img', { src: src });
        return new Promise<void>((resolve, _) => {
          imgElem.addEventListener('load', () => {
            resolve();
          }, { once: true });
        })
      })
    )
    
    // Load sound
    await Promise.all(
      Object.keys(assetMap.audio).map(async name => {
        /**
          TODO: Need to load audio
        */
        const audio = new Audio(assetMap.audio[name]);
        assets.addAudio(name, audio);
      })
    )
    
    return assets;
  }
}