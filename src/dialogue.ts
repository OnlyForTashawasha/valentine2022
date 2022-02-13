import { text } from "@fortawesome/fontawesome-svg-core";
import { assetsPath } from "./assetMap";
import { DialogueAudio } from "./audio";
import { createHTMLElement as e, replaceChildren } from "./helpers"

export type Dialogue = {
  text: string,
  name: string,
  spriteSrc: string,
  // The time taken for each word to be spoken 
  wordTime?: number,
}

export async function createConversation(
  dialogues: Array<Dialogue>,
  dialogueElem: HTMLElement,
  dAudio: DialogueAudio
  ): Promise<void>
{
  for (const d of dialogues) {
    await createDialogue(d, dialogueElem, dAudio);
  }
}

/**
 * Creates a dialogue box from the given text
 * @param text 
 * @param sprite 
 * @param dialogueElem 
 */
export function createDialogue(
  d: Dialogue, dialogueElem: HTMLElement, dAudio: DialogueAudio
  ): Promise<void>
{
  return new Promise((resolve, _) => {
    dialogueElem.addEventListener(`click`, () => {
      resolve();
    }, { once: true })
    // Text
    const textElem = e(`div`, {
      class: `dialogue-text`,
    })
    
    // Create dialogue
    const elem = e(`div`, {
      class: `dialogue-wrapper`,
      children: [
        e(`img`, {
          class: `dialogue-img`,
          src: d.spriteSrc
        }),
        e(`div`, {
          class: `dialogue-content`,
          children: [
            e(`div`, {
              class: `dialogue-name`,
              innerText: d.name
            }),
            textElem
          ]
        })
      ]
    });
    replaceChildren(dialogueElem, elem);
    dialogueElem.style.opacity = `1`;
    dialogueElem.style.zIndex = `9999`;
    
    // Shows the words one at a time
    const speakText = async () => {
      // Split text into words
      const words = d.text.split(" ");
      const defaultWordTime = 0.05;
      const wordTime = d.wordTime || defaultWordTime;
      let totalStr: null | string = null;
      for (const w of words) {
        // Update total string
        totalStr = totalStr === null ? w : totalStr + ` ${w}`;
        textElem.innerText = totalStr;
        // dAudio
        dAudio.generate(w, wordTime);
        await new Promise((r, _) => setTimeout(r, wordTime * 1000));
      }
    }
    speakText();
  })
}

export function clearDialogue(dialogueElem: HTMLElement): void {
  dialogueElem.style.opacity = `0`;
  dialogueElem.style.zIndex = `0`;
}

export const introDialogue = [
  {
    name: "Mr Borker",
    spriteSrc: `${assetsPath}/mrborker/neutral.png`,
    text: "*Bork bork*"
  },
  {
    name: "Mr Borker",
    spriteSrc: `${assetsPath}/mrborker/angry.png`,
    text: "Stahp you intruder!!",
    wordTime: 0.05,
  },
  {
    name: "Mr Borker",
    spriteSrc: `${assetsPath}/mrborker/disappointed.png`,
    text: "Wait ...."
  },
  {
    name: "Mr Borker",
    spriteSrc: `${assetsPath}/mrborker/disappointed.png`,
    text: "I know you ...",
    wordTime: 0.15,
  },
  {
    name: "Mr Borker",
    spriteSrc: `${assetsPath}/mrborker/happy.png`,
    text: "It`s Tashawasha!!! *Happy Noises*",
    wordTime: 0.05,
  },
  {
    name: "Mr Borker",
    spriteSrc: `${assetsPath}/mrborker/neutral.png`,
    text: "Mr Borker wants to wish Tashawasha and Ash a happy valentine`s day!!",
    wordTime: 0.05,
  },
  {
    name: "Mr Borker",
    spriteSrc: `${assetsPath}/mrborker/happy.png`,
    text: "Anddd Ash tried to surprise you again by leaving a cute valentine letter for you!",
    wordTime: 0.05,
  },
  {
    name: "Mr Borker",
    spriteSrc: `${assetsPath}/mrborker/neutral.png`,
    text: "Let me get it for you!",
    wordTime: 0.05,
  },
  {
    name: "Mr Borker",
    spriteSrc: `${assetsPath}/mrborker/neutral.png`,
    text: ".",
    wordTime: 0.1,
  },
  {
    name: "Mr Borker",
    spriteSrc: `${assetsPath}/mrborker/disappointed.png`,
    text: ". . .",
    wordTime: 0.2,
  },
  {
    name: "Mr Borker",
    spriteSrc: `${assetsPath}/mrborker/shocked.png`,
    text: ".... IT`S GONE!!!",
    wordTime: 0.2,
  },
  {
    name: "Mr Borker",
    spriteSrc: `${assetsPath}/mrborker/sad.png`,
    text: "O no - where did it go ;-;",
    wordTime: 0.05,
  },
  {
    name: "SandWitch",
    spriteSrc: `${assetsPath}/sandwitch/neutral.png`,
    text: "Mwahahahaha",
    wordTime: 0.05,
  },
  {
    name: "Mr Borker",
    spriteSrc: `${assetsPath}/mrborker/angry.png`,
    text: "Wait who are you????",
    wordTime: 0.05,
  },
  {
    name: "SandWitch",
    spriteSrc: `${assetsPath}/sandwitch/serious.png`,
    text: "I am the great SandWitch of Oz!!"
  },
  {
    name: "SandWitch",
    spriteSrc: `${assetsPath}/sandwitch/weird.png`,
    text: "And I am making the ultimate UWU potion to take over the world!!!"
  },
  {
    name: "SandWitch",
    spriteSrc: `${assetsPath}/sandwitch/laugh.png`,
    text: "... and your cute little letter is a perfect ingredient for my potion :3"
  },
  {
    name: "Mr Borker",
    spriteSrc: `${assetsPath}/mrborker/angry.png`,
    text: "Hey give it back!!!"
  },
  {
    name: "SandWitch",
    spriteSrc: `${assetsPath}/sandwitch/weird.png`,
    text: "Too Bread - it`s mine now doggo"
  },
  {
    name: "Mr Borker",
    spriteSrc: `${assetsPath}/mrborker/angry.png`,
    text: "Give it back - or your going to be in the dog house!!!"
  },
  {
    name: "SandWitch",
    spriteSrc: `${assetsPath}/sandwitch/laugh.png`,
    text: "MWHAHAHA - I like to see you try!!"
  },
  {
    name: "SandWitch",
    spriteSrc: `${assetsPath}/sandwitch/cough.png`,
    text: "*coughs*"
  },
  {
    name: "SandWitch",
    spriteSrc: `${assetsPath}/sandwitch/neutral.png`,
    text: "Ehem - anyways - laters doggo"
  },
  {
    name: "Mr Borker",
    spriteSrc: `${assetsPath}/mrborker/sad.png`,
    text: "Hey!!!"
  },
  {
    name: "Mr Borker",
    spriteSrc: `${assetsPath}/mrborker/angry.png`,
    text: "Okaii Tashawashaa lets go catch that borkin Sandwitch!!!"
  },
]

export const bossFightDialogue = [
  {
    name: "Mr Borker",
    spriteSrc: `${assetsPath}/mrborker/angry.png`,
    text: "There you are you woofin Sandwitch!!!"
  },
  {
    name: "Mr Borker",
    spriteSrc: `${assetsPath}/mrborker/angry.png`,
    text: "You are TOAST now!!!"
  },
  {
    name: "SandWitch",
    spriteSrc: `${assetsPath}/sandwitch/serious.png`,
    text: "Quit barkin at me you doggo"
  },
  {
    name: "SandWitch",
    spriteSrc: `${assetsPath}/sandwitch/weird.png`,
    text: "But Im afraid ...."
  },
  {
    name: "SandWitch",
    spriteSrc: `${assetsPath}/sandwitch/laugh.png`,
    text: "It`s too late mWAHAHAH!!!"
  },
  {
    name: "SandWitch",
    spriteSrc: `${assetsPath}/sandwitch/neutral.png`,
    text: "My UWU potion is complete!!!"
  },
  {
    name: "SandWitch",
    spriteSrc: `${assetsPath}/sandwitch/laugh.png`,
    text: "I can feel the power MWAHAHA"
  },
  {
    name: "SandWitch",
    spriteSrc: `${assetsPath}/sandwitch/serious.png`,
    text: "and you are dead me FUR real now doggo!!"
  },
  {
    name: "Mr Borker",
    spriteSrc: `${assetsPath}/mrborker/sad.png`,
    text: "O no ..."
  },
]

export const endingDialogue = [
  {
    name: "SandWitch",
    spriteSrc: `${assetsPath}/sandwitch/serious.png`,
    text: "How can this be?"
  },
  {
    name: "SandWitch",
    spriteSrc: `${assetsPath}/sandwitch/neutral.png`,
    text: "How can you be so ...."
  },
  {
    name: "SandWitch",
    spriteSrc: `${assetsPath}/sandwitch/serious.png`,
    text: "... PAWerful.."
  },
  {
    name: "Mr Borker",
    spriteSrc: `${assetsPath}/mrborker/sly.png`,
    text: "You BREADer give up now you sandwitch"
  },
  {
    name: "Mr Borker",
    spriteSrc: `${assetsPath}/mrborker/angry.png`,
    text: "And give back the valentine letter to Tashawasha!!!"
  },
  {
    name: "SandWitch",
    spriteSrc: `${assetsPath}/sandwitch/serious.png`,
    text: "... take it .."
  },
  {
    name: "SandWitch",
    spriteSrc: `${assetsPath}/sandwitch/serious.png`,
    text: "It's too much UWU for me to handle ..."
  },
]