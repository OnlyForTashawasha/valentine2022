import { Assets } from "./assets";
import { assetsPath } from "./assetMap";
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

export class DialogueAudio {
  private _assets: Assets;
  
  constructor(assets: Assets) {
    this._assets = assets;
  }
  
  // Word to say and how long to say it for
  async generate(text: string, time: number): Promise<void> {
    const audio = this._assets.getAudio('blipMale')!;
    await new Promise<void>((resolve, _) => {
      /**
        Beeps don't seem to work on mobile so just disable it
      */
      if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        resolve();
        return;
      }
      audio.volume = 0.4;
      audio.currentTime = 0;
      audio.playbackRate = time / audio.duration;
      audio.onended = () => resolve();
      // Play the audio
      audio.play();
      // setTimeout(() => {
      //   audio.pause();
      //   resolve();
      // }, time * 1000);
    });
  }
}