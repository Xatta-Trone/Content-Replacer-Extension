let chunks = [];
let mediaRecorder;

chrome.runtime.onMessage.addListener((message) => {
  if (message.name !== 'startRecordingOnBackground') {
    return;
  }

  // Prompt user to choose screen or window
  chrome.desktopCapture.chooseDesktopMedia(
    ['screen', 'window'],
    function (streamId) {
      if (streamId == null) {
        return;
      }

      // Once user has chosen screen or window, create a stream from it and start recording
      navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: streamId,
              minFrameRate: 30,
            },
          },
        })
        .then((stream) => {
          mediaRecorder = new MediaRecorder(stream);

          chunks = [];

          mediaRecorder.ondataavailable = handleDataAvailable;
          mediaRecorder.onstop = async function (e) {
            downloadVideo();
            // When recording is finished, send message to current tab content script with the base64 video
            chrome.tabs.query(
              { active: true, currentWindow: true },
              function (tabs) {
                window.close();
              }
            );
            // Stop all tracks of stream
            stream.getTracks().forEach((track) => track.stop());
          };

          mediaRecorder.start();
        })
        .finally(async () => {
          // After all setup, focus on previous tab (where the recording was requested)
          await chrome.tabs.update(message.body.currentTab.id, {
            active: true,
            selected: true,
          });
        });
    }
  );
});

function handleDataAvailable(event) {
  if (event.data.size > 0) {
    chunks.push(event.data);
  }
}

function downloadVideo() {
  const blob = new Blob(chunks, { type: 'video/webm' });
  // Convert the WebM video to MP4
  const reader = new FileReader();
  reader.onloadend = function () {
    const buffer = new Uint8Array(reader.result);
    const mp4Blob = new Blob([buffer], { type: 'video/mp4' });
    const mp4Url = URL.createObjectURL(mp4Blob);

    // chrome.tabs.create({ url: mp4Url });

    chrome.downloads.download({
      url: mp4Url,
      filename: 'recorded_screen.mp4',
      saveAs: true,
    });
  };
  reader.readAsArrayBuffer(blob);
}
