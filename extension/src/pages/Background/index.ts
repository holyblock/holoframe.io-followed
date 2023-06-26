import config from '../../../../utils/config';

// -----------------------------------------------
// --------------- Helper functions --------------
// -----------------------------------------------

const getChromeCache = async (key: string): Promise<number | undefined> => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([key], function (result) {
      if (result[key] === undefined) {
        resolve(undefined);
      } else {
        resolve(result[key] as number);
      }
    });
  });
};

const initiateRenderLoop = async (cachedTabId?: number) => {
  const intervalMS = 33.3; // 30 FPS

  // Clear existing interval if exists
  const renderIntervalId: number | undefined = await getChromeCache('renderIntervalId');
  if (renderIntervalId) {
    clearInterval(renderIntervalId);
  }

  // Start new interval
  const newIntervalId = setInterval(() => {
    // If cached tab found, send to that tab only
    if (cachedTabId) {
      chrome.tabs.sendMessage(cachedTabId, {
        type: 'manual_render'
      });
    } else {
      chrome.tabs.query({}, (tabs) => {
        // If no cache found, send to all tabs
        for (let tab of tabs) {
          chrome.tabs.sendMessage(tab?.id!, {
            type: 'manual_render'
          });
        }
      });
    }
  }, intervalMS);

  // Cache interval Id
  chrome.storage.sync.set({ renderIntervalId: newIntervalId });
};

// Remove cached tab Id and interval Id
const clearCache = () => {
  chrome.storage.sync.remove('recipientTabId');
  chrome.storage.sync.remove('renderIntervalId');
};

// -----------------------------------------------
// --------------- Manual rendering --------------
// -----------------------------------------------

// Handle manual render upon inactive tab
chrome.runtime.onMessage.addListener(
  async (request, sender, sendResponse) => {
    // Filter for only message from our content script
    if (request.source === "content") {
      chrome.storage.sync.set({ recipientTabId: sender.tab?.id }); // Cache tab Id

      if (request.type === "initiate_render") {
        // Enable manual render
        initiateRenderLoop(sender.tab?.id);
      } else if (request.type === "clear_render") {
        // Disable manual render
        const renderIntervalId: number | undefined = await getChromeCache('renderIntervalId');
        if (renderIntervalId) {
          clearInterval(renderIntervalId);
        }
        chrome.storage.sync.remove('renderIntervalId');
      }
    }
    sendResponse({ ack: true });
  }
);

// Remove cache upon navigating away from supported pages
chrome.tabs.onUpdated.addListener(async (tabId: number, changeInfo: any) => {
  const cachedTabId: number | undefined = await getChromeCache('recipientTabId');
  if (
    changeInfo.url && cachedTabId && cachedTabId === tabId &&
    !config.extension.platforms.supportedUrls.some(
      url => changeInfo.url?.includes(url)
    )
  ) {
    clearCache();
  }
});


// Remove cache upon target tab closed
chrome.tabs.onRemoved.addListener(async (tabId: number) => {
  const cachedTabId: number | undefined = await getChromeCache('recipientTabId');
  if (cachedTabId && cachedTabId === tabId) {
    clearCache();
  }
});

// Remove cache upon window closed
chrome.windows.onRemoved.addListener(clearCache);

// Handles service worker restart
(async () => {
  const renderIntervalId: number | undefined = await getChromeCache('renderIntervalId');
  const cachedTabId: number | undefined = await getChromeCache('recipientTabId');

  // If interval Id found, initiate render loop
  if (renderIntervalId) {
    await initiateRenderLoop(cachedTabId);
  }
})();