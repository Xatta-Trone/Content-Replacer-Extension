/**
 *==================================================================================================================================
 *==================================================================================================================================
 * Image related settings, image settings related to mouse move is after video section
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
  if (userUrl == null || userUrl == '') return;
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
      // imgElement.setAttribute(
      //   'style',
      //   `
      //   height: ${imgElement.clientHeight}px;
      //   width: ${imgElement.clientWidth}px;
      // `
      // );
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
 * Image select on mouse move
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

var imageTimer;
document.addEventListener('keydown', function (event) {
  // Check if the keys pressed are Ctrl + Shift + B
  if (event.ctrlKey && event.shiftKey) {
    console.log('Ctrl + Shift pressed');
    document.addEventListener('mousemove', onMouseMove);
    // Add your desired action or code here
  }
});

document.addEventListener('keyup', function (event) {
  // Reset the flag when Ctrl key is released
  document.removeEventListener('mousemove', onMouseMove);
});

function onMouseMove(event) {
  clearTimeout(imageTimer);
  imageTimer = setTimeout(() => mouseStopped(event), 400);
  // console.log('Mouse Position:', { x: mouseX, y: mouseY }, mouseStopped);
}

function mouseStopped(event) {
  currentImageElement = null;
  // Get the mouse position
  const mouseX = event.clientX;
  const mouseY = event.clientY;
  // the actual function that is called
  console.log('mouse stopped', mouseX, mouseY);
  const targetElement = document.elementFromPoint(mouseX, mouseY);

  // Do something with the target element, for example, log its tag name to the console
  if (targetElement) {
    console.log('Target Element:', targetElement);
    const resultImg = findImageRecursively(targetElement);

    if (resultImg) {
      showImagePopup(event, resultImg);
      console.log('Image found:', resultImg);
    } else {
      console.log('Image not found.');
    }
  }
}

function findImageRecursively(node, depth = 0) {
  if (!node || depth > 3) {
    // Stop recursion if the node is null or reached the maximum depth
    return null;
  }

  // Check if the current node has an img element
  const imgElement = node.querySelector('img');
  if (imgElement) {
    // If found, return the img element
    return imgElement;
  }

  // If not found, go up to the parent node and continue the search
  return findImageRecursively(node.parentNode, depth + 1);
}
