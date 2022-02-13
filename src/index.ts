import { assetsPath, GAMEASSETS } from "./assetMap";
import { AssetLoader } from "./assets";
import { DialogueAudio } from "./audio";
import { clearDialogue, createConversation, createDialogue, introDialogue } from "./dialogue";
import { Game } from "./game";
import { createClickToStart } from "./gameUi";
import { setMobileFullScreen } from "./helpers";
import { createLoadingScreen, exitLoadingScreen } from "./loading";

export const VERSION = '1.1.0';

const main = async () => {
  console.log(`Version ${VERSION}`);

  createLoadingScreen(document.getElementById('root')!);
  
  // Load assets
  const assets = await (new AssetLoader()).load(GAMEASSETS);
  
  exitLoadingScreen(document.getElementById('root')!);
  
  setMobileFullScreen();
  
  const dAudio = new DialogueAudio(assets);
  
  await createClickToStart(document.getElementById('ui')!);
  
  // Only play intro if not played before
  const dialogueRoot = document.getElementById('dialogue-root')!
  
  if (window.localStorage.getItem('introPlayed') !== 'true') {
    await createConversation(
      introDialogue,
      dialogueRoot,
      dAudio
    );
    window.localStorage.setItem('introPlayed', 'true');
  } else {
    await createDialogue(
      {
        name: "Mr Borker",
        spriteSrc: `${assetsPath}/mrborker/neutral.png`,
        text: "Tashawasha, let's go chase after that Sandwitch!!",
        wordTime: 0.05,
      },
      dialogueRoot,
      dAudio
    )
  }
  clearDialogue(dialogueRoot);
  
  /**
    Start the game
  */
  const g = new Game(assets, document.getElementById('root')!, dAudio);
  g.attach();
  g.start();
}
main();