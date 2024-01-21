import canvasBuilder from './canvasBuilder';
import icons from './icons';
import commonData from './common';
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
let currentVideoElement = null;
detectVideos();
buildVideoPopup();

function buildVideoPopup() {
  let style = document.createElement('style');
  style.innerHTML = `
  .extension-video-popup ${commonData.popupStyle}
  .extension-video-popup button {display: block;}
  .extension-drop-area ${commonData.dropAreaStyle}
  .extension-drop-area.highlight ${commonData.dropAreaHighLightStyle}
  `;
  document.body.appendChild(style);

  const div = canvasBuilder.popupBuilder({
    id: 'extension-video-popup',
    className: 'extension-video-popup ',
    html: `<strong>Video Detected</strong>`,
  });

  // video replace by url btn
  const videoURLBtn = canvasBuilder.buildButton({
    btnText: 'Video URL',
    icon: icons.play,
    onclick: handleVideoURLBtnClick,
  });

  // delete element button
  const deleteButton = canvasBuilder.buildButton({
    btnText: 'Delete Video',
    icon: icons.delete,
    onclick: deleteVideoClick,
  });

  // hide button click
  const hideButton = canvasBuilder.buildButton({
    btnText: 'Hide Video',
    icon: icons.eye,
    onclick: hideVideoClick,
  });

  const onclickBtn = canvasBuilder.buildButton({
    btnText: 'Javascript Action',
    icon: icons.code,
    onclick: onClickHandler,
  });

  const videoDropArea = document.createElement('div');
  videoDropArea.id = 'extension-video-drop-area';
  videoDropArea.className = 'extension-drop-area';
  videoDropArea.innerHTML = `<span display='inline-block'>Drag and drop an video here or click to select one</span><input type="file" accept="video/*" id="extensionVideoFileInput" style="display: none;">`;

  let hr = canvasBuilder.buildHr();
  let hr2 = canvasBuilder.buildHr();
  let hr3 = canvasBuilder.buildHr();

  div.appendChild(hr);
  div.appendChild(onclickBtn);
  div.appendChild(hr2);
  div.appendChild(videoURLBtn);
  div.appendChild(videoDropArea);
  div.appendChild(hr3);
  div.appendChild(deleteButton);
  div.appendChild(hideButton);

  document.body.appendChild(div);
  initVideoDropArea();
}

function onClickHandler() {
  var jsCodeBlock = prompt('Enter a valid JS code block:');
  if (jsCodeBlock != '' || jsCodeBlock != null) {
    currentVideoElement.removeAttribute('onclick');
    currentVideoElement.setAttribute('onclick', jsCodeBlock);
  }
}

function initVideoDropArea() {
  const dropArea = document.getElementById('extension-video-drop-area');
  const fileInput = document.getElementById('extensionVideoFileInput');
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
      if (file && file.type.startsWith('video')) {
        const fileURL = URL.createObjectURL(file);
        setVideoSource(currentVideoElement, fileURL);
        // currentVideoElement.src = fileURL;
        // currentVideoElement.play();
      } else {
        alert('Please select a valid video file.');
      }
    }
    hideVideoPopup();
  }
}

function detectVideos() {
  let videos = document.getElementsByTagName('video');
  console.log('videos on this page', videos);

  // Add a contextmenu event listener to each videos
  for (let index = 0; index < videos.length; index++) {
    let video = videos[index];
    video.addEventListener('contextmenu', function (event) {
      // Prevent the default context menu from appearing
      event.preventDefault();
      // Alert the id of the clicked element
      // alert('Right-click detected on button with id: ' + element.id);
      showVideoPopup(event, video);
    });
  }
}

function showVideoPopup(event, element) {
  // alert("Popup is shown");
  var popup = document.getElementById('extension-video-popup');
  popup.style.display = 'block';
  currentVideoElement = element;
  console.log(element);

  // Calculate position based on the clicked element's coordinates
  var x = event.clientX + window.scrollX;
  var y = event.clientY + window.scrollY;

  popup.style.left = x + 'px';
  popup.style.top = y + 'px';
}
// Function to hide the popup
function hideVideoPopup() {
  var popup = document.getElementById('extension-video-popup');
  popup.style.display = 'none';
}

function handleVideoURLBtnClick() {
  if (currentVideoElement == null) {
    return alert('No video selected');
  }
  let url = `https://placehold.co/${currentVideoElement.clientWidth}x${currentVideoElement.clientHeight}.mp4`;
  // let poster = `https://placehold.co/${currentVideoElement.clientWidth}x${currentVideoElement.clientHeight}?text=Video`;
  let userUrl = prompt('Enter video URL', url);
  console.log(userUrl);
  if (userUrl != null || userUrl != '') {
    console.log(currentVideoElement);
    setVideoSource(currentVideoElement, userUrl);
  }
}

function setVideoSource(videoEl, url, poster = null) {
  if (url == null || url == '') return;
  // videoEl.setAttribute(
  //   'style',
  //   `height: ${videoEl.clientHeight}px;
  //    width: ${videoEl.clientWidth}px;`
  // );

  if (videoEl.hasAttribute('poster') || videoEl.hasAttribute('data-poster')) {
    videoEl.removeAttribute('data-poster');
    videoEl.poster = `https://placehold.co/${videoEl.clientWidth}x${videoEl.clientHeight}?text=Video`;
  }

  videoEl.src = url;

  if (poster != null) {
    videoEl.poster = poster;
  }

  var sourceElements = videoEl.querySelectorAll('source');
  sourceElements.forEach(function (source) {
    source.setAttribute('srcset', url);
    source.setAttribute('src', url);
    source.setAttribute('data-srcset', url);
    source.setAttribute('data-src', url);
  });

  videoEl.load();

  if (
    videoEl.hasAttribute('autoplay') ||
    videoEl.hasAttribute('data-autoplay')
  ) {
    videoEl.addEventListener('loadedmetadata', function () {
      // Play the video
      videoEl.play();
    });
  }
}

function deleteVideoClick() {
  if (currentVideoElement != null) {
    currentVideoElement.remove();
    currentVideoElement = null;
  }
}

function hideVideoClick() {
  if (currentVideoElement != null) {
    currentVideoElement.style.display = 'none';
    currentVideoElement = null;
  }
}

document.addEventListener('click', function () {
  hideVideoPopup();
});

/**
 *==================================================================================================================================
 *==================================================================================================================================
 * Image select on mouse move
 __      _______ _____  ______ ____
 \ \    / /_   _|  __ \|  ____/ __ \
  \ \  / /  | | | |  | | |__ | |  | |
   \ \/ /   | | | |  | |  __|| |  | |
    \  /   _| |_| |__| | |___| |__| |
     \/   |_____|_____/|______\____/
 *==================================================================================================================================
 *==================================================================================================================================
 */

var videoTimer;
document.addEventListener('keydown', function (event) {
  // Check if the keys pressed are Ctrl + Shift + B
  if (event.ctrlKey && event.altKey) {
    console.log('Ctrl + Alt pressed');
    document.addEventListener('mousemove', onMouseMoveVideo);
    // Add your desired action or code here
  }
});

document.addEventListener('keyup', function (event) {
  // Reset the flag when Ctrl key is released
  document.removeEventListener('mousemove', onMouseMoveVideo);
});

function onMouseMoveVideo(event) {
  clearTimeout(videoTimer);
  videoTimer = setTimeout(() => mouseStoppedVideo(event), 400);
  // console.log('Mouse Position:', { x: mouseX, y: mouseY }, mouseStoppedVideo);
}

function mouseStoppedVideo(event) {
  currentVideoElement = null;
  // Get the mouse position
  const mouseX = event.clientX;
  const mouseY = event.clientY;
  // the actual function that is called
  console.log('mouse stopped', mouseX, mouseY);
  const targetElement = document.elementFromPoint(mouseX, mouseY);

  // Do something with the target element, for example, log its tag name to the console
  if (targetElement) {
    console.log('Target Element:', targetElement);
    const resultImg = findVideoRecursively(targetElement);

    if (resultImg) {
      showVideoPopup(event, resultImg);
      console.log('video found:', resultImg);
    } else {
      console.log('video not found.');
    }
  }
}

function findVideoRecursively(node, depth = 0) {
  if (!node || depth > 3) {
    // Stop recursion if the node is null or reached the maximum depth
    return null;
  }

  // Check if the current node has an img element
  const element = node.querySelector('video');
  if (element) {
    // If found, return the img element
    return element;
  }

  // If not found, go up to the parent node and continue the search
  return findVideoRecursively(node.parentNode, depth + 1);
}
