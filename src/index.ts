import { GAMEASSETS } from "./assetMap";
import { AssetLoader } from "./assets";
import { clearDialogue, createConversation, introDialogue } from "./dialogue";
import { Game } from "./game";
import { setMobileFullScreen } from "./helpers";
import { createLoadingScreen, exitLoadingScreen } from "./loading";

export const VERSION = '1.0.1';

const main = async () => {
  console.log(`Version ${VERSION}`);

  createLoadingScreen(document.getElementById('root')!);
  
  // Load assets
  const assets = await (new AssetLoader()).load(GAMEASSETS);
  
  exitLoadingScreen(document.getElementById('root')!);
  
  setMobileFullScreen();
  
  // Only play intro if not played before
  const dialogueRoot = document.getElementById('dialogue-root')!
  if (window.localStorage.getItem('introPlayed') !== 'true') {
    await createConversation(
      introDialogue,
      dialogueRoot
    );
    window.localStorage.setItem('introPlayed', 'true');
  }
  clearDialogue(dialogueRoot);
  
  /**
    Start the game
  */
  const g = new Game(assets, document.getElementById('root')!);
  g.attach();
  g.start();
}
main();