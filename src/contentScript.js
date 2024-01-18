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

/****
 * Button related functions
 *
 *
 *
 * ***/

let buttonTags = [
  'button',
  // '.btn',
  // '[class*=btn]',
  'a[role=button]',
  'span[role=button]',
  'input[type=button]',
  'input[type=submit]',
  'input[type=reset]',
];

function detectButton() {
  let elements = [];
  buttonTags.forEach((tag) => elements.push(...document.querySelectorAll(tag)));

  console.log(elements);

  // Add a contextmenu event listener to each buttons
  elements.forEach(function (element) {
    element.addEventListener('contextmenu', function (event) {
      // Prevent the default context menu from appearing
      event.preventDefault();
      // Alert the id of the clicked element
      // alert('Right-click detected on button with id: ' + element.id);
      showPopup(event, element);
    });
  });
}

detectButton();
buildButtonPopup();

let currentButtonElement = null;

function buildButtonPopup() {
  let style = document.createElement('style');
  style.innerHTML = ` .extension-popup {
        display: none;
        position: absolute;
        background-color: #fff;
        border: 1px solid #ccc;
        padding: 15px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        z-index: 99999999;
      }
      .extension-popup button {
        display: block;
      }


      `;
  document.body.appendChild(style);

  const div = document.createElement('div');
  div.id = 'extension-popup';
  div.className = 'extension-popup ';
  div.innerHTML = `<p>Button popup</p>`;

  // delete element button
  const deleteButton = document.createElement('button');
  deleteButton.innerHTML = 'Delete button';
  deleteButton.onclick = deleteButtonClick;

  // hide button click
  const hideButton = document.createElement('button');
  hideButton.innerHTML = 'Hide button';
  hideButton.onclick = hideButtonClick;

  // change bg color click
  const changeBgColorButton = document.createElement('button');
  changeBgColorButton.innerHTML = 'Change background color';
  changeBgColorButton.onclick = changeButtonBgColor;

  // add right click handler
  const onclickBtn = document.createElement('button');
  onclickBtn.innerHTML = 'Add JS action';
  onclickBtn.onclick = onClickButtonAction;

  div.appendChild(deleteButton);
  div.appendChild(hideButton);
  div.appendChild(changeBgColorButton);
  div.appendChild(onclickBtn);

  document.body.appendChild(div);
}

function onClickButtonAction() {
  var jsCodeBlock = prompt('Enter a valid JS code block:');
  if (jsCodeBlock != '' || jsCodeBlock != null) {
    currentButtonElement.removeAttribute('onclick');
    currentButtonElement.setAttribute('onclick', jsCodeBlock);
  }
}

function deleteButtonClick() {
  if (currentButtonElement != null) {
    currentButtonElement.remove();
    currentButtonElement = null;
  }
}

function hideButtonClick() {
  if (currentButtonElement != null) {
    currentButtonElement.style.display = 'none';
    currentButtonElement = null;
  }
}

function changeButtonBgColor() {
  if (currentButtonElement != null) {
    var color = prompt('Enter a valid color name/code:');
    if (color != '' || color != null) {
      currentButtonElement.style.backgroundColor = color;
    }
    currentButtonElement = null;
  }
}

function showPopup(event, element) {
  // alert("Popup is shown");
  var popup = document.getElementById('extension-popup');
  popup.style.display = 'block';
  console.log(event, popup, element);
  currentButtonElement = element;

  // Calculate position based on the clicked element's coordinates
  var x = event.clientX + window.pageXOffset;
  var y = event.clientY + window.pageYOffset;

  popup.style.left = x + 'px';
  popup.style.top = y + 'px';
}

// Function to hide the popup
function hidePopup() {
  var popup = document.getElementById('extension-popup');
  popup.style.display = 'none';
}

document.addEventListener('click', function () {
  hidePopup();
});

/**
 *=================================================================
 *
 * Image contents
 *
 *=================================================================
 */
// image related

detectImage();
buildImagePopup();

let currentImageElement = null;
let imageWidth = null;
let imageHeight = null;

function buildImagePopup() {
  let style = document.createElement('style');
  style.innerHTML = ` .extension-image-popup {
        display: none;
        position: absolute;
        background-color: #fff;
        border: 1px solid #ccc;
        padding: 15px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        z-index: 99999999;
      }
      .extension-image-popup button {
        display: block;
      }


      `;
  document.body.appendChild(style);

  const div = document.createElement('div');
  div.id = 'extension-image-popup';
  div.className = 'extension-image-popup ';
  div.innerHTML = `
  <p>Image popup</p>
  `;

  // delete element button
  const imgUrlBtn = document.createElement('button');
  imgUrlBtn.innerHTML = 'Image URL';
  imgUrlBtn.onclick = handleImageUrlClick;

  // add right click handler
  const onclickBtn = document.createElement('button');
  onclickBtn.innerHTML = 'Add click action';
  onclickBtn.onclick = onClickHandler;

  div.appendChild(imgUrlBtn);
  div.appendChild(onclickBtn);

  document.body.appendChild(div);
}

function onClickHandler() {
  var jsCodeBlock = prompt('Enter a valid JS code block:');
  if (jsCodeBlock != '' || jsCodeBlock != null) {
    currentImageElement.removeAttribute('onclick');
    currentImageElement.setAttribute('onclick', jsCodeBlock);
  }
}

function handleImageUrlClick() {
  if (currentImageElement == null) {
    return alert('No image selected');
  }
  let url = `https://placehold.co/${currentImageElement.clientWidth}x${currentImageElement.clientHeight}`;
  let userUrl = prompt('Enter image URL', url);

  if (
    currentImageElement.parentNode != null &&
    currentImageElement.parentNode.nodeName === 'PICTURE'
  ) {
    currentImageElement = currentImageElement.parentNode;
  }

  console.log(currentImageElement.parentNode, currentImageElement);

  // placeholder ulr
  if (currentImageElement && currentImageElement.nodeName === 'IMG') {
    if (userUrl != null || userUrl != '') {
      currentImageElement.srcset = '';
      currentImageElement.loading = 'eager';
      currentImageElement.removeAttribute('decoding');
      currentImageElement.removeAttribute('srcset');
      currentImageElement.removeAttribute('data-srcset');
      currentImageElement.removeAttribute('data-src');
      currentImageElement.setAttribute('src', userUrl);
    }
  }

  // try for picture images
  if (currentImageElement && currentImageElement.nodeName === 'PICTURE') {
    var imgElement = currentImageElement.querySelector('img');
    if (imgElement) {
      currentImageElement.srcset = '';
      currentImageElement.loading = 'eager';
      currentImageElement.removeAttribute('decoding');
      currentImageElement.removeAttribute('srcset');
      currentImageElement.removeAttribute('data-srcset');
      currentImageElement.removeAttribute('data-src');
      currentImageElement.setAttribute('src', userUrl);
    }

    var sourceElements = currentImageElement.querySelectorAll('source');
    sourceElements.forEach(function (source) {
      source.setAttribute('srcset', userUrl);
      source.setAttribute('src', userUrl);
      source.setAttribute('data-srcset', userUrl);
      source.setAttribute('data-src', userUrl);
    });
  }
}

function showImagePopup(event, element) {
  // alert("Popup is shown");
  var popup = document.getElementById('extension-image-popup');
  popup.style.display = 'block';
  currentImageElement = element;
  currentImageElement.loading = 'eager';

  console.log(element);

  // Calculate position based on the clicked element's coordinates
  var x = event.clientX + window.scrollX;
  var y = event.clientY + window.scrollY;

  popup.style.left = x + 'px';
  popup.style.top = y + 'px';
}

// Function to hide the popup
function hideImagePopup() {
  var popup = document.getElementById('extension-image-popup');
  popup.style.display = 'none';
}

document.addEventListener('click', function () {
  hideImagePopup();
});

function detectImage() {
  let images = document.getElementsByTagName('img');
  console.log('images on this page', images);

  // Add a contextmenu event listener to each images
  for (let index = 0; index < images.length; index++) {
    let image = images[index];
    image.addEventListener('contextmenu', function (event) {
      // Prevent the default context menu from appearing
      event.preventDefault();
      // Alert the id of the clicked element
      // alert('Right-click detected on button with id: ' + element.id);
      showImagePopup(event, image);
    });
  }

  // replace pictures
  // let pictures = document.getElementsByTagName('picture');

  // console.log('pictures on this page', pictures);

  // for (var i = 0; i < pictures.length; i++) {
  //   var imgElement = pictures[i].querySelector('img');
  //   console.log(imgElement);
  //   if (imgElement) {
  //     imgElement.addEventListener('contextmenu', function (event) {
  //       // Prevent the default context menu from appearing
  //       event.preventDefault();
  //       // Alert the id of the clicked element
  //       // alert('Right-click detected on button with id: ' + element.id);
  //       showImagePopup(event, imgElement);
  //     });
  //   } else {
  //     console.log(pictures[i]);
  //     pictures[i].addEventListener('contextmenu', function (event) {
  //       // Prevent the default context menu from appearing
  //       event.preventDefault();
  //       // Alert the id of the clicked element
  //       // alert('Right-click detected on button with id: ' + element.id);
  //       console.log(pictures[i]);
  //       showImagePopup(event, pictures[i]);
  //     });
  //   }
  // }
}

function checkIfImageHasPictureParent(imgElement) {
  return imgElement.parentNode && imgElement.parentNode.nodeName === 'PICTURE';
}
