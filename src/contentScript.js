'use strict';

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

const IDS = {
  divId: 'extension-capture-div',
  button1Id: 'extension-capture-button',
  button2Id: 'extension-capture-button2',
  button22Id: 'extension-capture-button22',
  button3Id: 'extension-close-button',
};

function createDiv() {
  const div = document.createElement('div');
  div.id = IDS.divId;
  div.setAttribute(
    'style',
    'display:block; margin-top:10px;text-align:center;position:sticky;bottom:20px;left:100%;transform:translateX(-10%);z-index:99999;max-width:10%;'
  );

  const button = document.createElement('button');
  button.id = IDS.button1Id;
  button.innerText = 'Turn Grayscale';
  button.setAttribute(
    'style',
    'padding:14px 25px; color:white; background: #242424;margin-bottom: 10px;cursor: pointer;'
  );
  button.onclick = () => turnGrayScale();

  const button2 = document.createElement('button');
  button2.id = IDS.button2Id;
  button2.innerText = 'Record video';
  button2.setAttribute(
    'style',
    'padding:14px 25px; color:white; background: #242424;margin-bottom: 10px;cursor: pointer;'
  );

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

  div.appendChild(button);
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

function injectJS() {
  const jsCode = prompt('Paste the Javascript code you want to execute here:');

  if (jsCode == null || jsCode == '') {
    return;
  }

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
