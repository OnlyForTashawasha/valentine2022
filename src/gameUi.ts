import { createHTMLElement as e, replaceChildren } from "./helpers"

export type ProgressBarProps = {
  backgroundColor?: string;
  progressColorGradient?: string;
  text?: string;
  textColor?: string;
  textBannerColor?: string;
}

export function createProgress(
  root: HTMLElement, props: ProgressBarProps = {}
): void {
  // Make progress
  const progress = e('div', {
    id: 'progress',
    class: 'progress',
  });
  progress.style.backgroundImage = props.progressColorGradient || 'linear-gradient(45deg, #f0b541, #ff8933)';
  // Make background
  const progressBar = e('div', {
    class: 'progress-bar',
    children: [
     progress
    ]
  })
  progressBar.style.backgroundColor = props.backgroundColor || '#dfe0e8';
  
  const text = e('div', {
    class: 'progress-text',
    innerText: props.text || ''
  })
  text.style.color = props.textColor || '#14182e';
  text.style.backgroundColor = props.textBannerColor || '#dfe0e8';
  
  replaceChildren(root, e('div', {
    class: 'progress-wrapper',
    children: [
      text,
      progressBar
    ]
  }));
}

// export function createGameUi(root: HTMLElement) {
//   replaceChildren(root, e('div', {
//     class: 'progress-bar',
//     children: [
//       e('div', {
//         id: 'progress',
//         class: 'progress',
//       })
//     ]
//   }))
// }

export function createHomeUi(root: HTMLElement, onPlay: () => void) {
  replaceChildren(root, e('div', {
    class: 'home-ui-wrapper',
    children: [
      e('button', {
        onclick: onPlay,
        innerText: 'PLAY',
        class: 'home-ui-btn',
      })
    ]
  }))
}

export function clearUi(root: HTMLElement) {
  replaceChildren(root, null)
}

export function setProgress(value: number): void {
  document.getElementById('progress')!.style.width = `${value}%`;
}