'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.type === 'GREETINGS') {
//     const message = `Hi ${
//       sender.tab ? 'Con' : 'Pop'
//     }, my name is Bac. I am from Background. It's great to hear from you.`;

//     // Log message coming from the `request` parameter
//     console.log(request.payload.message);
//     // Send a response message
//     sendResponse({
//       message,
//     });
//   }
// });

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, {
    message: 'TOGGLE_MENU',
  });
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'EXECUTE') {
    console.log('execute');
    let code = request.code;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const activeTab = tabs[0];
      chrome.scripting
        .executeScript({
          target: { tabId: activeTab.id },
          func: (code) => {
            const el = document.createElement('script');
            el.textContent = code;
            document.documentElement.appendChild(el);
            el.remove();
          },
          args: [code],
          world: 'MAIN',
        })
        .then(() => console.log('injected a function'));
    });
  }

  if (request.type === 'RECORDING_START') {
    startRecording();
    // start recording
    sendResponse({
      message: 'Recording started',
    });
  }
  return true;
});

const startRecording = async () => {
  await chrome.tabs.query(
    { active: true, lastFocusedWindow: true, currentWindow: true },
    async function (tabs) {
      // Get current tab to focus on it after start recording on recording screen tab
      const currentTab = tabs[0];

      // Create recording screen tab
      const tab = await chrome.tabs.create({
        url: chrome.runtime.getURL('recording_screen.html'),
        pinned: true,
        active: true,
      });

      // Wait for recording screen tab to be loaded and send message to it with the currentTab
      chrome.tabs.onUpdated.addListener(async function listener(tabId, info) {
        if (tabId === tab.id && info.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);

          await chrome.tabs.sendMessage(tabId, {
            name: 'startRecordingOnBackground',
            body: {
              currentTab: currentTab,
            },
          });
        }
      });
    }
  );
};


