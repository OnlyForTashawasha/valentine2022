import { Assets } from "./assets";

export class GameAudio {
  private _assets: Assets;
  private _currentAudio: HTMLAudioElement | null = null;
  
  constructor(assets: Assets) {
    this._assets = assets;
  }
  
  /**
   * Plays the given audio stopping the previous one
   * @param name 
   */
  play(name: string, loop: boolean = false): void {
    const audio = this._assets.getAudio(name);
    if (audio === null) {
      throw new Error(`Audio with name ${name} doesn't exist`);
    }
    // Stop previous audio
    if (this._currentAudio !== null) {
      this._currentAudio.pause();
      this._currentAudio.currentTime = 0;
    }
    audio.loop = loop;
    // Starts new audio
    this._currentAudio = audio;
    audio.play();
  }
}