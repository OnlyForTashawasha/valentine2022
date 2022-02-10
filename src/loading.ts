import { createHTMLElement as e, replaceChildren } from "./helpers"

export function createLoadingScreen(root: HTMLElement): void {
  const elem = e('div', {
    class: 'loading-wrapper',
    children: [
      e('img', {
        class: 'loading-img',
        src: '../assets/loadingLogo.svg'
      }),
      e('div', {
        class: 'loading-text',
        innerText: 'Loading cuteness ...'
      })
    ]
  });
  elem.style.opacity = '1';
  replaceChildren(root, elem);
}

export function exitLoadingScreen(root: HTMLElement): void {
  if (root.children.length > 0) {
    (root.children[0] as any).style.opacity = '0';
  }
}