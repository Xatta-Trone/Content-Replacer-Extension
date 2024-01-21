import canvasBuilder from './canvasBuilder';
import icons from './icons';
import commonData from './common';
/**
 *==================================================================================================================================
 *==================================================================================================================================
 * Bg image select on mouse move
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
let currentBgImageElement = null;
detectBgImg();
buildBGImagePopup();

function buildBGImagePopup() {
  let style = document.createElement('style');
  style.innerHTML = `
      .extension-bg-image-popup ${commonData.popupStyle}
      .extension-bg-image-popup button {display: block;}
      .extension-drop-area ${commonData.dropAreaStyle}
      .extension-drop-area.highlight ${commonData.dropAreaHighLightStyle}
      `;
  document.body.appendChild(style);

  const div = canvasBuilder.popupBuilder({
    id: 'extension-bg-image-popup',
    className: 'extension-bg-image-popup ',
    html: `<strong>BG Image Detected</strong>`,
  });

  const imgUrlBtn = canvasBuilder.buildButton({
    btnText: 'Image URL',
    icon: icons.image,
    onclick: handleBgImageUrlClick,
  });

  const onclickBtn = canvasBuilder.buildButton({
    btnText: 'Javascript Action',
    icon: icons.code,
    onclick: bgOnClickHandler,
  });

  const imgDropArea = document.createElement('div');
  imgDropArea.id = 'extension-bg-img-drop-area';
  imgDropArea.className = 'extension-drop-area';
  imgDropArea.innerHTML = `<span display='inline-block'>Drag and drop an image here or click to select one</span>
  <input type="file" id="extensionBgImageFileInput" style="display: none;">`;

  const deleteButton = canvasBuilder.buildButton({
    btnText: 'Delete Image',
    icon: icons.delete,
    onclick: deleteBgImageClick,
  });

  let hr = canvasBuilder.buildHr();
  let hr2 = canvasBuilder.buildHr();
  let hr3 = canvasBuilder.buildHr();

  div.appendChild(hr);
  div.appendChild(onclickBtn);
  div.appendChild(hr2);
  div.appendChild(imgUrlBtn);
  div.appendChild(imgDropArea);
  div.appendChild(hr3);
  div.appendChild(deleteButton);

  document.body.appendChild(div);
  initBgImageElementDropArea();
}

function initBgImageElementDropArea() {
  const dropArea = document.getElementById('extension-bg-img-drop-area');
  const fileInput = document.getElementById('extensionBgImageFileInput');
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
        setBgImageSource(currentBgImageElement, base64Data);
      };

      reader.readAsDataURL(file);
    }
  }
}

function detectBgImg() {
  const srcChecker = /url\(\s*?['"]?\s*?(\S+?)\s*?["']?\s*?\)/i;
  let bgImgElements = Array.from(
    Array.from(document.querySelectorAll('*')).reduce((collection, node) => {
      let prop = window
        .getComputedStyle(node, null)
        .getPropertyValue('background-image');
      // match `url(...)`
      let match = srcChecker.exec(prop);
      if (match) {
        // console.log(node);
        // found bg image
        collection.add(node);
      }
      return collection;
    }, new Set())
  );

  console.log('bgImgElements on this page', bgImgElements);

  // Add a contextmenu event listener to each images
  for (let index = 0; index < bgImgElements.length; index++) {
    let element = bgImgElements[index];
    element.addEventListener('contextmenu', function (event) {
      // Prevent the default context menu from appearing
      event.preventDefault();
      // Alert the id of the clicked element
      // alert('Right-click detected on button with id: ' + element.id);
      showBgImagePopup(event, element);
    });
  }
}

function showBgImagePopup(event, element) {
  // alert("Popup is shown");
  var popup = document.getElementById('extension-bg-image-popup');
  popup.style.display = 'block';
  currentBgImageElement = element;
  console.log(element);

  // Calculate position based on the clicked element's coordinates
  var x = event.clientX + window.scrollX;
  var y = event.clientY + window.scrollY;

  popup.style.left = x + 'px';
  popup.style.top = y + 'px';
}

// Function to hide the popup
function hideBgImagePopup() {
  var popup = document.getElementById('extension-bg-image-popup');
  popup.style.display = 'none';
}

document.addEventListener('click', function () {
  hideBgImagePopup();
});

function handleBgImageUrlClick() {
  if (currentBgImageElement == null) {
    return alert('No element selected');
  }
  let url = `https://placehold.co/${currentBgImageElement.clientWidth}x${currentBgImageElement.clientHeight}`;
  let userUrl = prompt('Enter image URL', url);

  console.log(currentBgImageElement.parentNode, currentBgImageElement);
  setBgImageSource(currentBgImageElement, userUrl);
}

function setBgImageSource(currentImageElement, userUrl) {
  if (userUrl == null || userUrl == '' || currentBgImageElement == null) return;
  currentImageElement.style.backgroundImage = `url("${userUrl}")`;
  hideBgImagePopup();
}

function deleteBgImageClick() {
  if (currentBgImageElement == null) {
    return;
  }
  currentBgImageElement.style.backgroundImage = ``;
  currentBgImageElement = null;
  hideBgImagePopup();
}

function bgOnClickHandler() {
  var jsCodeBlock = prompt('Enter a valid JS code block:');
  if (jsCodeBlock != '' || jsCodeBlock != null) {
    currentBgImageElement.removeAttribute('onclick');
    currentBgImageElement.setAttribute('onclick', jsCodeBlock);
  }
}

/**
 *==================================================================================================================================
 *==================================================================================================================================
 * Bg Image select on mouse move
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

var bgImageTimer;
document.addEventListener('keydown', function (event) {
  // Check if the keys pressed are Ctrl + Shift + B
  if (event.ctrlKey && event.key == 'z') {
    console.log('Ctrl + z pressed');
    document.addEventListener('mousemove', onBgMouseMove);
    // Add your desired action or code here
  }
});

document.addEventListener('keyup', function (event) {
  // Reset the flag when Ctrl key is released
  document.removeEventListener('mousemove', onBgMouseMove);
});

function onBgMouseMove(event) {
  clearTimeout(bgImageTimer);
  bgImageTimer = setTimeout(() => bgMouseStopped(event), 400);
  // console.log('Mouse Position:', { x: mouseX, y: mouseY }, bgMouseStopped);
}

function bgMouseStopped(event) {
  currentBgImageElement = null;
  // Get the mouse position
  const mouseX = event.clientX;
  const mouseY = event.clientY;
  // the actual function that is called
  console.log('mouse stopped', mouseX, mouseY);
  const targetElement = document.elementFromPoint(mouseX, mouseY);

  // Do something with the target element, for example, log its tag name to the console
  if (targetElement) {
    console.log('Target Element:', targetElement);
    const result = findBgImageRecursively(targetElement);

    if (result) {
      showBgImagePopup(event, result);
      console.log('bg Image found:', result);
    } else {
      console.log('bg Image not found.');
    }
  }
}

function findBgImageRecursively(node, depth = 0) {
  const srcChecker = /url\(\s*?['"]?\s*?(\S+?)\s*?["']?\s*?\)/i;
  if (!node || depth > 3) {
    // Stop recursion if the node is null or reached the maximum depth
    return null;
  }
  let prop = window
    .getComputedStyle(node, null)
    .getPropertyValue('background-image');
  // match `url(...)`
  let match = srcChecker.exec(prop);
  if (match) {
    return node;
  }

  return findBgImageRecursively(node.parentNode, depth + 1);
}
