import canvasBuilder from './canvasBuilder';
import icons from './icons';
import commonData from './common';
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
const button = {
  currentButtonElement: null,
  detectButton: () => {
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
    buttonTags.forEach((tag) =>
      elements.push(...document.querySelectorAll(tag))
    );

    console.log(elements);

    // Add a contextmenu event listener to each buttons
    elements.forEach(function (element) {
      element.addEventListener('contextmenu', function (event) {
        // Prevent the default context menu from appearing
        event.preventDefault();
        // Alert the id of the clicked element
        // alert('Right-click detected on button with id: ' + element.id);
        button.showPopup(event, element);
      });
    });
  },

  buildButtonPopup: () => {
    let style = document.createElement('style');
    style.innerHTML = `
  .extension-popup ${commonData.popupStyle}
  .extension-image-popup button {display: block;}
  `;

    document.body.appendChild(style);

    const div = canvasBuilder.popupBuilder({
      id: 'extension-popup',
      className: 'extension-popup',
      html: `<strong>Button Detected</strong>`,
    });

    // delete element button
    const deleteButton = canvasBuilder.buildButton({
      btnText: 'Delete Button',
      icon: icons.delete,
      onclick: button.deleteButtonClick,
    });

    // hide button click
    const hideButton = canvasBuilder.buildButton({
      btnText: 'Hide Button',
      icon: icons.eye,
      onclick: button.hideButtonClick,
    });

    // change bg color click
    const changeBgColorButton = canvasBuilder.buildButton({
      btnText: 'Change BG Color',
      icon: icons.colorPalate,
      onclick: button.changeButtonBgColor,
    });

    // add right click handler
    const onclickBtn = canvasBuilder.buildButton({
      btnText: 'Javascript Action',
      icon: icons.code,
      onclick: button.onClickButtonAction,
    });

    const btnCross = canvasBuilder.crossBuilder();
    btnCross.onclick = button.hidePopup;

    let hr = canvasBuilder.buildHr();
    let hr2 = canvasBuilder.buildHr();

    div.appendChild(hr);
    div.appendChild(changeBgColorButton);
    div.appendChild(onclickBtn);
    div.appendChild(hr2);
    div.appendChild(deleteButton);
    div.appendChild(hideButton);
    div.appendChild(btnCross);

    document.body.appendChild(div);
  },

  onClickButtonAction: () => {
    var jsCodeBlock = prompt('Enter a valid JS code block:');
    if (jsCodeBlock != '' || jsCodeBlock != null) {
      button.currentButtonElement.setAttribute('onclick', jsCodeBlock);
    }
    button.hidePopup();
  },

  deleteButtonClick: () => {
    if (button.currentButtonElement != null) {
      button.currentButtonElement.remove();
      button.currentButtonElement = null;
    }
    button.hidePopup();
  },

  hideButtonClick: () => {
    if (button.currentButtonElement != null) {
      button.currentButtonElement.style.display = 'none';
      button.currentButtonElement = null;
    }
    button.hidePopup();
  },

  changeButtonBgColor: () => {
    if (button.currentButtonElement != null) {
      var color = prompt('Enter a valid color name/code:');
      if (color != '' || color != null) {
        button.currentButtonElement.style.backgroundColor = color;
      }
      button.currentButtonElement = null;
    }
    button.hidePopup();
  },

  showPopup: (event, element) => {
    // alert("Popup is shown");
    var popup = document.getElementById('extension-popup');
    console.log(event, popup, element);
    button.currentButtonElement = element;

    // Calculate position based on the clicked element's coordinates
    var x = window.scrollX;
    var y = window.scrollY;

    if (event == null || event == undefined) {
      const rect = element.getBoundingClientRect();
      x += rect.left * 1.1;
      y += rect.top * 1.1;
    } else {
      x = x + event.clientX;
      y = y + event.clientY;
    }

    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
    popup.style.display = 'block';
  },

  // Function to hide the popup
  hidePopup: () => {
    var popup = document.getElementById('extension-popup');
    popup.style.display = 'none';
  },
};

// document.addEventListener('click', function () {
//   button.hidePopup();
// });
export default button;
