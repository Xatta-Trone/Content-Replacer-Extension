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

/**
 *==================================================================================================================================
 *==================================================================================================================================
 * Button related settings
  ____  _    _ _______ _______ ____  _   _
 |  _ \| |  | |__   __|__   __/ __ \| \ | |
 | |_) | |  | |  | |     | | | |  | |  \| |
 |  _ <| |  | |  | |     | | | |  | | . ` |
 | |_) | |__| |  | |     | | | |__| | |\  |
 |____/ \____/   |_|     |_|  \____/|_| \_|
 *==================================================================================================================================
 *==================================================================================================================================
 */
detectButton();
buildButtonPopup();


function detectButton() {
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
 *==================================================================================================================================
 *==================================================================================================================================
 * Image related settings
  _____
 |_   _|
   | |  _ __ ___   __ _  __ _  ___
   | | | '_ ` _ \ / _` |/ _` |/ _ \
  _| |_| | | | | | (_| | (_| |  __/
 |_____|_| |_| |_|\__,_|\__, |\___|
                         __/ |
                        |___/
 *==================================================================================================================================
 *==================================================================================================================================
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

      .extension-drop-area {
          border: 2px dashed #ccc;
          padding: 20px;
          text-align: center;
          cursor: pointer;
      }

      .extension-drop-area.highlight {
          border-color: #2196F3;
      }

      .extension-drop-result {
          margin-top: 20px;
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

  const imgDropArea = document.createElement('div');
  imgDropArea.id = 'extension-img-drop-area';
  imgDropArea.className = 'extension-drop-area';
  imgDropArea.innerHTML = `
<p>Drag and drop an image here or click to select one</p>
<input type="file" id="extensionImageFileInput" style="display: none;">
`;

  // delete element button
  const deleteButton = document.createElement('button');
  deleteButton.innerHTML = 'Delete Image';
  deleteButton.onclick = deleteImageClick;

  // hide button click
  const hideButton = document.createElement('button');
  hideButton.innerHTML = 'Hide Image';
  hideButton.onclick = hideImageClick;

  div.appendChild(imgUrlBtn);
  div.appendChild(onclickBtn);
  div.appendChild(imgDropArea);
  div.appendChild(deleteButton);
  div.appendChild(hideButton);

  document.body.appendChild(div);

  initImageDropArea();
}

function initImageDropArea() {
  const dropArea = document.getElementById('extension-img-drop-area');
  const fileInput = document.getElementById('extensionImageFileInput');
  // const resultDiv = document.getElementById('result');

  // Prevent default behavior for drag and drop
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
    dropArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });

  // Highlight drop area when dragging over
  ['dragenter', 'dragover'].forEach((eventName) => {
    dropArea.addEventListener(eventName, highlight, false);
  });

  // Remove highlight when dragging leaves
  ['dragleave', 'drop'].forEach((eventName) => {
    dropArea.addEventListener(eventName, unhighlight, false);
  });

  // Handle dropped files
  dropArea.addEventListener('drop', handleDrop, false);

  // Open file dialog when click on the drop area
  dropArea.addEventListener('click', () => {
    fileInput.click();
  });

  // Handle files selected from file input
  fileInput.addEventListener('change', handleChange, false);

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function highlight() {
    dropArea.classList.add('highlight');
  }

  function unhighlight() {
    dropArea.classList.remove('highlight');
  }

  function handleChange(e) {
    if (e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
  }

  function handleFiles(files) {
    console.log(files);
    const fileList = Array.from(files);
    for (const file of fileList) {
      const reader = new FileReader();

      reader.onload = function (e) {
        const base64Data = e.target.result;
        console.log(file.name);
        setImageSource(currentImageElement, base64Data);
      };

      reader.readAsDataURL(file);
    }
  }
}

function deleteImageClick() {
  if (currentImageElement != null) {
    if (
      currentImageElement.parentNode != null &&
      currentImageElement.parentNode.nodeName === 'PICTURE'
    ) {
      currentImageElement.parentNode.remove();
    } else {
      currentImageElement.remove();
    }
    currentImageElement = null;
  }
}

function hideImageClick() {
  if (currentImageElement != null) {
    currentImageElement.style.display = 'none';
    currentImageElement = null;
  }
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

  console.log(currentImageElement.parentNode, currentImageElement);
  setImageSource(currentImageElement, userUrl);
}

function setImageSource(currentImageElement, userUrl) {
  if (
    currentImageElement.parentNode != null &&
    currentImageElement.parentNode.nodeName === 'PICTURE'
  ) {
    currentImageElement = currentImageElement.parentNode;
  }

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
      currentImageElement.setAttribute(
        'height',
        currentImageElement.clientHeight
      );
      currentImageElement.setAttribute(
        'width',
        currentImageElement.clientWidth
      );
      currentImageElement.setAttribute(
        'style',
        `
        height: ${currentImageElement.clientHeight}px;
        width: ${currentImageElement.clientWidth}px;
      `
      );
    }
  }

  // try for picture images
  if (currentImageElement && currentImageElement.nodeName === 'PICTURE') {
    var imgElement = currentImageElement.querySelector('img');
    if (imgElement) {
      imgElement.srcset = '';
      imgElement.loading = 'eager';
      imgElement.removeAttribute('decoding');
      imgElement.removeAttribute('srcset');
      imgElement.removeAttribute('data-srcset');
      imgElement.removeAttribute('data-src');
      imgElement.setAttribute('src', userUrl);
      imgElement.setAttribute('height', imgElement.clientHeight);
      imgElement.setAttribute('width', imgElement.clientWidth);
      imgElement.setAttribute(
        'style',
        `
        height: ${imgElement.clientHeight}px;
        width: ${imgElement.clientWidth}px;
      `
      );
    }

    var sourceElements = currentImageElement.querySelectorAll('source');
    sourceElements.forEach(function (source) {
      source.setAttribute('srcset', userUrl);
      source.setAttribute('src', userUrl);
      source.setAttribute('data-srcset', userUrl);
      source.setAttribute('data-src', userUrl);
    });
  }
  hideImagePopup();
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



/**
 *==================================================================================================================================
 *==================================================================================================================================
 * Video related settings
 __      _______ _____  ______ ____
 \ \    / /_   _|  __ \|  ____/ __ \
  \ \  / /  | | | |  | | |__ | |  | |
   \ \/ /   | | | |  | |  __|| |  | |
    \  /   _| |_| |__| | |___| |__| |
     \/   |_____|_____/|______\____/
 *==================================================================================================================================
 *==================================================================================================================================
 */
