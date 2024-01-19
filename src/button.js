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
