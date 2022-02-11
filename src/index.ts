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
  
  const dialogueRoot = document.getElementById('dialogue-root')!
  await createConversation(
    introDialogue,
    dialogueRoot
  );
  clearDialogue(dialogueRoot);
  
  /**
    Start the game
  */
  const g = new Game(assets, document.getElementById('root')!);
  g.attach();
  g.start();
}
main();