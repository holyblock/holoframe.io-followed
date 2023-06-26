export const getChromeCache = async (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([key], function (result) {
      if (result[key] === undefined) {
        resolve(undefined);
      } else {
        resolve(result[key]);
      }
    });
  });
};