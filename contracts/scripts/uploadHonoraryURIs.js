const { uploadData } = require("../utils/bundlr.js");

const assetURIs = require("../utils/honoraryAssetURIs.json");

// Upload either a single URI file or all specified URIs in the JSON
const targetURIName = ""; // Leave empty for uploading all

const main = async () => {
  if (!targetURIName) {
    for (let i = 0; i < assetURIs.length; i += 1) {
      uploadData(JSON.stringify(assetURIs[i])).then((txID) => {
        console.log("Successfully upload file with tx ID: ", txID);
      });
    }
  } else {
    const targetIndex = assetURIs.findIndex((item) => {
      return item.name === targetURIName;
    });
    if (typeof targetIndex === "number") {
      const targetURI = assetURIs[targetIndex];
      const txID = await uploadData(JSON.stringify(targetURI));
      console.log("Successfully upload file with tx ID: ", txID);
    }
  }
};

main();
