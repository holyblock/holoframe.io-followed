const { uploadFolder } = require("../utils/bundlr.js");

// Upload a single honorary's asset files (model and image)
const assetName = ""; // EDIT THIS

if (!assetName) {
  throw new Error("No asset name declared");
}
// Declare paths and generate token URI
const assetFolderPath = `./assets/honoraries/${assetName}`;
(async () => {
  const manifestID = await uploadFolder(assetFolderPath);
  console.log("Finished uploading folder via Bundlr", manifestID);
})();
