
const messages = [
  `pg1sdfsdfffffffffffffffffffffff`,
  'sdfsdfsdfffffffffffffffffffsdfs',
  'pg3',
  'pg4',
  'pg5',
]

function setMobileFullScreen() {
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

function createHTMLElement(name, attributes) {
  let newElem = document.createElement(name);
  for (let a in attributes) {
    if (a.startsWith('on')) {
      newElem.addEventListener(a.substring(2), attributes[a]);
    } else if (a == 'innerText') {
      newElem.innerText = attributes[a];
    } else if (a == 'class') {
      //Add each class to the class list
      for (let className of attributes[a].split(' ')) {
        newElem.classList.add(className);
      }
    } else if (a == 'children') {
      //If given a list of children, add it to the new element
      for (let child of attributes[a]) {
        newElem.appendChild(child);
      }
    } else {
      newElem.setAttribute(a, attributes[a]);
    }
  }
  return newElem;
}

function update(index) {
  const wrapper = document.getElementById('panelWrapper');
  [...wrapper.children].forEach((c, i) => {
    if (i === index) {
      c.classList.add('panelShow');
    } else {
      c.classList.remove('panelShow');
    }
  })
};

function init() {
  setMobileFullScreen();
  
  // Delete letter on click
  document.getElementById('present').addEventListener('click', () => {
    document.getElementById('present').remove();
  })
  
  const wrapper = document.getElementById('panelWrapper');
  // Make messages
  messages.map(m => {
    const e = createHTMLElement('div', {
      class: 'panel',
      children: [
        createHTMLElement('div', {
          class: 'panelText',
          innerText: m
        })
      ]
    });
    // Add to wrapper
    wrapper.appendChild(e);
  })
  
  let index = 0;
  update(index);
  document.getElementById('nextBtn').addEventListener('click', () => {
    index = (index + 1) % wrapper.children.length;
    update(index);
  })
  document.getElementById('prevBtn').addEventListener('click', () => {
    index = (index - 1);
    if (index === -1) {
      index = wrapper.children.length - 1;
    }
    update(index);
  })
}

init();