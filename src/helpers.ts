
export type Range = {
  // Start should be less than end
  start: number;
  end: number;
}

export function setMobileFullScreen() {
  // We execute the same script as before
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  // We listen to the resize event
  window.addEventListener('resize', () => {
    // We execute the same script as before
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  });
}

export type Attributes = {
  [key: string]: any;
  innerText?: string;
  'class'?: string;
  children?: Array<HTMLElement>;
}

/**
 * 
 * @param name 
 * @param attributes 
 * @returns 
 */
export function createHTMLElement(name: string, attributes: Attributes): HTMLElement {
  let newElem = document.createElement(name);
  for (let a in attributes) {
    if (a.startsWith('on')) {
      newElem.addEventListener(a.substring(2), attributes[a]);
    } else if (a == 'innerText') {
      newElem.innerText = attributes[a]!;
    } else if (a == 'class') {
      //Add each class to the class list
      for (let className of attributes[a]!.split(' ')) {
        newElem.classList.add(className);
      }
    } else if (a == 'children') {
      //If given a list of children, add it to the new element
      for (let child of attributes[a]!) {
        newElem.appendChild(child);
      }
    } else {
      newElem.setAttribute(a, attributes[a]);
    }
  }
  return newElem;
}

export function replaceChildren(root: HTMLElement, children: any): void {
  // For older browsers that dont have replace children
  if (root.replaceChildren === undefined) {
    for (const c of root.children) {
      root.removeChild(c);
    }
    if (children !== null) {
      root.appendChild(children);
    }
  } else {
    if (children !== null) {
      root.replaceChildren(children);
    } else {
      root.replaceChildren();
    }
  }
}

export function lerp(start: number, end: number, scale: number): number {
  return (end - start) * scale + start; 
}

export function berp(start: number, end: number, scale: number): number {
  if (scale < 0.5) {
    return start;
  }
  return end;
}