'use strict';
import './button.js';
import './image.js';
import './video.js';
import './bg-img.js';

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message == 'TOGGLE_MENU') {
    console.log('TOGGLING MENU');
    toggleBtnVisibility();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'downloadFile') {
    const blob = new Blob([message.data], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);
    console.log(url);
    // chrome.downloads.download({
    //   url: url,
    //   filename: 'recorded_screen.mp4',
    //   saveAs: true,
    // });
  }
});

const IDS = {
  divId: 'extension-capture-div',
  button1Id: 'extension-capture-button',
  button2Id: 'extension-capture-button2',
  button22Id: 'extension-capture-button22',
  button3Id: 'extension-close-button',
  button4Id: 'extension-text-button',
  button5Id: 'extension-btn-button',
};

function createDiv() {
  const div = document.createElement('div');
  div.id = IDS.divId;
  div.setAttribute(
    'style',
    'display:block; margin-top:10px;text-align:center;position:sticky;bottom:20px;left:100%;transform:translateX(-10%);z-index:99999;max-width:10%;'
  );

  const p = document.createElement('p');
  p.innerHTML = `Shortcut keys <br> ctrl + shift => image <br> ctrl+alt => video<br> ctrl+z => bg image.`;

  const button = document.createElement('button');
  button.id = IDS.button1Id;
  button.innerText = 'Turn Grayscale';
  button.setAttribute(
    'style',
    'padding:14px 25px; color:white; background: #242424;margin-bottom: 10px;cursor: pointer;'
  );
  button.onclick = () => turnGrayScale();

  const textButton = document.createElement('button');
  textButton.innerText = 'Change All Text';
  textButton.id = IDS.button4Id;
  textButton.setAttribute(
    'style',
    'padding:14px 25px; color:white; background: #242424;margin-bottom: 10px;cursor: pointer;'
  );
  textButton.onclick = () => changeAllTextRecursively(document.body);

  const btnButton = document.createElement('button');
  btnButton.innerText = 'Replace button text';
  btnButton.id = IDS.button5Id;
  btnButton.setAttribute(
    'style',
    'padding:14px 25px; color:white; background: #242424;margin-bottom: 10px;cursor: pointer;'
  );
  btnButton.onclick = () => replaceButtons();

  const button2 = document.createElement('button');
  button2.id = IDS.button2Id;
  button2.innerText = 'Record video';
  button2.setAttribute(
    'style',
    'padding:14px 25px; color:white; background: #242424;margin-bottom: 10px;cursor: pointer;'
  );
  button2.onclick = () => startRecording();

  const button22 = document.createElement('button');
  button22.id = IDS.button22Id;
  button22.innerText = 'Inject JavaScript';
  button22.setAttribute(
    'style',
    'padding:14px 25px; color:white; background: #242424;margin-bottom: 10px;cursor: pointer;'
  );
  button22.onclick = () => injectJS();

  const button3 = document.createElement('button');
  button3.innerHTML = '&times;';
  button3.id = IDS.button3Id;
  button3.setAttribute(
    'style',
    'font-size: 27px;position: absolute;top: 0;right: 0;border: 2px solid #242424;cursor: pointer; text-align: center;padding: 3px 8px; margin:0;color:white; background: #242424;'
  );
  button3.onclick = () => toggleBtnVisibility();

  div.appendChild(p);
  div.appendChild(button);
  div.appendChild(textButton);
  div.appendChild(btnButton);
  div.appendChild(button2);
  div.appendChild(button22);
  div.appendChild(button3);

  return div;
}

function createBtnEl(text, id, onclick = () => {}) {
  const button = document.createElement('button');
  button.innerHTML = text;
  button.id = id;
  button.setAttribute(
    'style',
    'font-size: 27px;position: absolute;top: 0;right: 0;border: 2px solid #242424;cursor: pointer; text-align: center;padding: 3px 8px; margin:0;color:white; background: #242424;'
  );
  button.onclick = onclick;
  return button;
}

function toggleBtnVisibility() {
  let el = document.getElementById(IDS.divId);

  if (el == null) {
    const div = createDiv();
    document.body.appendChild(div);
  } else {
    // Todo: remove all listeners
    el.remove();
  }
}

function turnGrayScale() {
  // apply grayscale
  let html = document.getElementsByTagName('html')[0];
  html.setAttribute(
    'style',
    `-moz-filter: grayscale(100%);-webkit-filter: grayscale(100%);filter: gray;filter: grayscale(100%);`
  );
}

function startRecording() {
  chrome.runtime.sendMessage(
    {
      type: 'RECORDING_START',
    },
    (response) => {
      console.log(response);
    }
  );
}

function injectJS() {
  const jsCode = prompt('Paste the Javascript code you want to execute here:');

  if (jsCode == null || jsCode == '') {
    return;
  }

  let script = document.createElement('script');
  script.type = 'text/javascript';
  script.innerHTML = jsCode;
  document.body.appendChild(script);

  chrome.runtime.sendMessage(
    {
      type: 'EXECUTE',
      code: jsCode,
    },
    (response) => {
      console.log(response);
    }
  );
}

function changeAllTextRecursively(element) {
  // Check if the element is not a script or style element
  if (
    element.tagName !== 'SCRIPT' &&
    element.tagName !== 'STYLE' &&
    element.tagName !== 'BUTTON'
  ) {
    // Update the text content of the element
    element.childNodes.forEach(function (node) {
      if (node.nodeType === 3) {
        // Text node
        node.textContent = replaceWithJibrish(node.textContent.trim());
      } else if (node.nodeType === 1) {
        // Element node
        // Recursively call the function for child elements
        changeAllTextRecursively(node);
      }
    });
  }
}

function replaceWithJibrish(originalText) {
  const loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Odio pellentesque diam volutpat commodo. Mauris cursus mattis molestie a iaculis at erat pellentesque. Potenti nullam ac tortor vitae purus faucibus ornare suspendisse sed. Nunc id cursus metus aliquam. Et malesuada fames ac turpis. Sed sed risus pretium quam vulputate dignissim suspendisse in. Leo duis ut diam quam nulla porttitor massa id neque. Etiam non quam lacus suspendisse faucibus interdum posuere. Eu consequat ac felis donec et odio pellentesque. Maecenas volutpat blandit aliquam etiam erat. At volutpat diam ut venenatis tellus in metus. Rutrum tellus pellentesque eu tincidunt tortor aliquam nulla. At volutpat diam ut venenatis tellus in metus.
    A erat nam at lectus. Diam donec adipiscing tristique risus nec feugiat. Quam vulputate dignissim suspendisse in est ante. At elementum eu facilisis sed odio morbi quis. Non blandit massa enim nec dui nunc mattis enim. Maecenas accumsan lacus vel facilisis. Dis parturient montes nascetur ridiculus mus mauris vitae ultricies leo. Nisi lacus sed viverra tellus in hac. Egestas pretium aenean pharetra magna ac. Platea dictumst vestibulum rhoncus est pellentesque elit ullamcorper dignissim cras.
    `;

  let splitted = loremIpsum.split(' ');
  let textLength = originalText.length;
  let wordCount = originalText.split(' ').length;
  let replacedText = [];

  while (textLength > 0) {
    let word = splitted.shift();

    if (word == undefined) {
      splitted = loremIpsum.split(' ');
      word = splitted.shift();
    }

    // check for single word
    textLength = textLength - word.length - 1;
    replacedText.push(word);
  }

  return replacedText.join(' ');
}

function replaceButtons() {
  let tags = [
    'button',
    '.btn',
    '[class*=btn]',
    'a[role=button]',
    'span[role=button]',
    'input[type=button]',
    'input[type=submit]',
    'input[type=reset]',
  ];
  let elements = [];

  tags.forEach((tag) => elements.push(...document.querySelectorAll(tag)));

  for (let index = 0; index < elements.length; index++) {
    if (
      elements[index].id !== IDS.button1Id &&
      elements[index].id !== IDS.button22Id &&
      elements[index].id !== IDS.button2Id &&
      elements[index].id !== IDS.button3Id &&
      elements[index].id !== IDS.button4Id &&
      elements[index].id !== IDS.button5Id
    ) {
      elements[index].innerText = 'Button';
    }
  }
};


