const { uploadFile } = require("../utils/bundlr.js");

// Upload a single honorary's asset files (model and image)
const assetFilePath = ""; // ./assets/honoraries/coolcat307/coolcat307.mp4

(async () => {
  if (!assetFilePath) {
    throw new Error("No file path declared");
  }
  const dataId = await uploadFile(assetFilePath);
  console.log("Finished uploading file via Bundlr", dataId);
})();
