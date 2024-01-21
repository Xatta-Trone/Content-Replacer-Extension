'use strict';
import './button.js';
import './image.js';
import './video.js';
import './bg-img.js';
import icons from './icons.js';
import canvasBuilder from './canvasBuilder.js';



// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

// Init commands
initFAB();

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
  fabBtnId: 'extension-toggle-button',
  xpathBtnId: 'extension-xpath-button',
};

function initFAB() {
  const fabBtn = document.createElement('div');
  fabBtn.innerHTML = icons.threeDot;
  fabBtn.setAttribute('id', 'extension-toggle-button');
  fabBtn.setAttribute(
    'style',
    `
    position: fixed;
    right: 20px;
    bottom: 20px;
    border-radius: 50%;
    background: #2D8DFF;
    padding: 10px 10px;
    color: white;
    text-align: center;
    line-height: 28px;
    cursor: pointer;
    z-index:99999999999999999999;
    `
  );
  fabBtn.onclick = () => {
    toggleBtnVisibility();
  };
  document.body.appendChild(fabBtn);
}

function createDiv() {
  const div = canvasBuilder.buildCanvas({ id: IDS.divId });

  const p = document.createElement('p');
  p.innerHTML = `<strong>Menu</strong> <br> Shortcut keys with mouse-move <br> Image: ctrl + shift <br> Video: ctrl + alt <br>BG Image: ctrl + z`;

  const hr = canvasBuilder.buildHr();
  const hr2 = canvasBuilder.buildHr();
  const hr3 = canvasBuilder.buildHr();

  const btnGrayScale = canvasBuilder.buildButton({
    id: IDS.button1Id,
    btnText: 'Turn Grayscale',
    icon: icons.colorPalate,
    onclick: turnGrayScale,
  });

  const btnTextChange = canvasBuilder.buildButton({
    id: IDS.button4Id,
    btnText: 'Change All Text',
    icon: icons.code,
    onclick: () => changeAllTextRecursively(document.body),
  });

  const btnBtnChange = canvasBuilder.buildButton({
    id: IDS.button5Id,
    btnText: 'Replace Button Text',
    icon: icons.code,
    onclick: replaceButtons,
  });

  const btnRecordVideo = canvasBuilder.buildButton({
    id: IDS.button2Id,
    btnText: 'Record Video',
    icon: icons.recording,
    onclick: startRecording,
  });

  const btnInjectJS = canvasBuilder.buildButton({
    id: IDS.button22Id,
    btnText: 'Inject JavaScript',
    icon: icons.code,
    onclick: injectJS,
  });

  const xpathBtn = canvasBuilder.buildButton({
    id: IDS.xpathBtnId,
    btnText: 'Xpath',
    icon: icons.code,
    onclick: setUsingXpath,
  });

  const btnCross = document.createElement('button');
  btnCross.innerHTML = '&times;';
  btnCross.id = IDS.button3Id;
  btnCross.setAttribute(
    'style',
    'font-size: 16px;position: absolute;top: 0;right: 0;border: none;cursor: pointer; text-align: center;padding: 3px 8px; margin:0;color:white;background: #10417a; border-radius:0 6px 0 6px;'
  );
  btnCross.onclick = () => toggleBtnVisibility();

  div.appendChild(p);
  div.appendChild(hr);
  div.appendChild(btnInjectJS);
  div.appendChild(hr);
  div.appendChild(btnRecordVideo);
  div.appendChild(btnGrayScale);
  div.appendChild(hr2);
  div.appendChild(btnBtnChange);
  div.appendChild(btnTextChange);
  div.appendChild(xpathBtn);
  div.appendChild(hr3);
  div.appendChild(btnCross);
  return div;
}

function setUsingXpath() {
  let xpath = prompt('Enter full xpath of the element');
  if (xpath == null || xpath == '') return;

  let element = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;

  if (element == null) {
    alert('No element found with xpath: ' + xpath);
    return;
  }
  console.log(element, element.nodeType, element.nodeName);
}

function toggleBtnVisibility() {
  let el = document.getElementById(IDS.divId);

  if (el == null) {
    el = createDiv();
    document.body.appendChild(el);
  }

  if (el != null) {
    el.style.display = el.style.display === 'none' ? 'inline-block' : 'none';
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
}
