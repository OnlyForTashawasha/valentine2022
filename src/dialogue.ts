import { createHTMLElement as e, replaceChildren } from "./helpers"

export type Dialogue = {
  text: string,
  name: string,
  spriteSrc: string,
}

export async function createConversation(
  dialogues: Array<Dialogue>,
  dialogueElem: HTMLElement): Promise<void>
{
  for (const d of dialogues) {
    await createDialogue(d, dialogueElem);
  }
}

/**
 * Creates a dialogue box from the given text
 * @param text 
 * @param sprite 
 * @param dialogueElem 
 */
export function createDialogue(
  d: Dialogue, dialogueElem: HTMLElement): Promise<void>
{
  return new Promise((resolve, _) => {
    dialogueElem.addEventListener('click', () => {
      resolve();
    }, { once: true })
    // Create dialogue
    const elem = e('div', {
      class: 'dialogue-wrapper',
      children: [
        e('img', {
          class: 'dialogue-img',
          src: d.spriteSrc
        }),
        e('div', {
          class: 'dialogue-content',
          children: [
            e('div', {
              class: 'dialogue-name',
              innerText: d.name
            }),
            e('div', {
              class: 'dialogue-text',
              innerText: d.text
            })
          ]
        })
      ]
    });
    replaceChildren(dialogueElem, elem);
    dialogueElem.style.opacity = '1';
    dialogueElem.style.zIndex = '9999';
  })
}

export function clearDialogue(dialogueElem: HTMLElement): void {
  dialogueElem.style.opacity = '0';
  dialogueElem.style.zIndex = '0';
}

export const introDialogue = [
  {
    name: "Mr Borker",
    spriteSrc: '../assets/mrborker/neutral.png',
    text: "*Bork bork*"
  },
  // {
  //   name: "Mr Borker",
  //   spriteSrc: '../assets/mrborker/angry.png',
  //   text: "Stahp you intruder!!"
  // },
  // {
  //   name: "Mr Borker",
  //   spriteSrc: '../assets/mrborker/disappointed.png',
  //   text: "Wait ...."
  // },
  // {
  //   name: "Mr Borker",
  //   spriteSrc: '../assets/mrborker/disappointed.png',
  //   text: "I know you ..."
  // },
  // {
  //   name: "Mr Borker",
  //   spriteSrc: '../assets/mrborker/happy.png',
  //   text: "It's Tashawasha!!! *Happy Noises*"
  // },
  // {
  //   name: "Mr Borker",
  //   spriteSrc: '../assets/mrborker/neutral.png',
  //   text: "Mr Borker wants to wish Tashawasha and Ash a happy valentine's day!!"
  // },
  // {
  //   name: "Mr Borker",
  //   spriteSrc: '../assets/mrborker/happy.png',
  //   text: "Anddd Ash tried to surprise you again by leaving a cute valentine letter for you!"
  // },
  // {
  //   name: "Mr Borker",
  //   spriteSrc: '../assets/mrborker/neutral.png',
  //   text: "Let me get it for you!"
  // },
  // {
  //   name: "Mr Borker",
  //   spriteSrc: '../assets/mrborker/neutral.png',
  //   text: "."
  // },
  // {
  //   name: "Mr Borker",
  //   spriteSrc: '../assets/mrborker/disappointed.png',
  //   text: "....."
  // },
  // {
  //   name: "Mr Borker",
  //   spriteSrc: '../assets/mrborker/shocked.png',
  //   text: ".... IT'S GONE!!!"
  // },
  // {
  //   name: "Mr Borker",
  //   spriteSrc: '../assets/mrborker/sad.png',
  //   text: "O no - where did it go ;-;"
  // },
  // {
  //   name: "SandWitch",
  //   spriteSrc: '../assets/sandwitch/neutral.png',
  //   text: "Mwahahahaha"
  // },
  // {
  //   name: "Mr Borker",
  //   spriteSrc: '../assets/mrborker/angry.png',
  //   text: "Wait who are you????"
  // },
  // {
  //   name: "SandWitch",
  //   spriteSrc: '../assets/sandwitch/serious.png',
  //   text: "I am the great SandWitch of Oz!!"
  // },
  // {
  //   name: "SandWitch",
  //   spriteSrc: '../assets/sandwitch/weird.png',
  //   text: "And I am making the ultimate UWU potion to take over the world!!!"
  // },
  // {
  //   name: "SandWitch",
  //   spriteSrc: '../assets/sandwitch/laugh.png',
  //   text: "... and your cute little letter is a perfect ingredient for my potion :3"
  // },
  // {
  //   name: "Mr Borker",
  //   spriteSrc: '../assets/mrborker/angry.png',
  //   text: "Hey give it back!!!"
  // },
  // {
  //   name: "SandWitch",
  //   spriteSrc: '../assets/sandwitch/weird.png',
  //   text: "Too Bread - it's mine now doggo"
  // },
  // {
  //   name: "Mr Borker",
  //   spriteSrc: '../assets/mrborker/angry.png',
  //   text: "Give it back - or your going to be in the dog house!!!"
  // },
  // {
  //   name: "SandWitch",
  //   spriteSrc: '../assets/sandwitch/laugh.png',
  //   text: "MWHAHAHA - I like to see you try!!"
  // },
  // {
  //   name: "SandWitch",
  //   spriteSrc: '../assets/sandwitch/cough.png',
  //   text: "*coughs*"
  // },
  // {
  //   name: "SandWitch",
  //   spriteSrc: '../assets/sandwitch/neutral.png',
  //   text: "Ehem - anyways - laters doggo"
  // },
  // {
  //   name: "Mr Borker",
  //   spriteSrc: '../assets/mrborker/sad.png',
  //   text: "Hey!!!"
  // },
  // {
  //   name: "Mr Borker",
  //   spriteSrc: '../assets/mrborker/angry.png',
  //   text: "Okaii Tashawashaa lets go catch that borkin Sandwitch!!!"
  // },
]

export const bossFightDialogue = [
  {
    name: "Mr Borker",
    spriteSrc: '../assets/mrborker/angry.png',
    text: "There you are you woofin Sandwitch!!!"
  },
  {
    name: "Mr Borker",
    spriteSrc: '../assets/mrborker/angry.png',
    text: "You are TOAST now!!!"
  },
  {
    name: "SandWitch",
    spriteSrc: '../assets/sandwitch/serious.png',
    text: "Quit barkin at me you doggo"
  },
  {
    name: "SandWitch",
    spriteSrc: '../assets/sandwitch/weird.png',
    text: "But Im afraid ...."
  },
  {
    name: "SandWitch",
    spriteSrc: '../assets/sandwitch/laugh.png',
    text: "It's too late mWAHAHAH!!!"
  },
  {
    name: "SandWitch",
    spriteSrc: '../assets/sandwitch/neutral.png',
    text: "My UWU potion is complete!!!"
  },
  {
    name: "SandWitch",
    spriteSrc: '../assets/sandwitch/laugh.png',
    text: "I can feel the power MWAHAHA"
  },
  {
    name: "SandWitch",
    spriteSrc: '../assets/sandwitch/serious.png',
    text: "and you are dead me FUR real now doggo!!"
  },
  {
    name: "Mr Borker",
    spriteSrc: '../assets/mrborker/sad.png',
    text: "O no ..."
  },
]