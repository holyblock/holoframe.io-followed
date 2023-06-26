const Bundlr = require("@bundlr-network/client").default;
const fs = require("fs");
const config = require("./config.js");

require("dotenv").config();

if (!process.env.ARWEAVE_KEY_ENCODED_BASE64) {
  throw new Error("Missing ARWEAVE_KEY_ENCODED_BASE64 env variable");
}

const networkURL = config.bundlr.prod.host;
const currency = config.bundlr.prod.currency;
const key = JSON.parse(
  Buffer.from(process.env.ARWEAVE_KEY_ENCODED_BASE64, "base64").toString(
    "ascii"
  )
);
const bundlr = new Bundlr(networkURL, currency, key);
console.log("Bundlr Address", bundlr.address);

const fundIfBelowThreshold = async (threshold, amount) => {
  // Check your balance
  const balance = await bundlr.getLoadedBalance();
  console.log("Current AR balance", balance);

  // If balance is < threshold AR
  if (balance < threshold) {
    console.log(`Current balance is below threshold. Funding ${amount} now.`);
    // Fund your account with amount AR
    await bundlr.fund(amount);
  }
};

const checkPriceAndFund = async (path) => {
  const data = Buffer.from(fs.readFileSync(path));
  const price = await bundlr.getPrice(data.length);
  console.log("Checking price needed", price);

  // Get your current balance
  const balance = await bundlr.getLoadedBalance();
  console.log("Checking Bundlr balance", balance);

  // If you don't have enough balance for the upload
  if (price > balance * 1.5) {
    // Fund your account with the difference
    // We multiply by 1.5 to make sure we don't run out of funds
    const newFund = parseInt((price - balance) * 1.5, 10);
    console.log("Balance will soon be insufficient, funding Bundlr", newFund);

    try {
      await bundlr.fund(newFund);
    } catch (e) {
      console.error(e);
    }
  }
};

/**
 * Upload buffer data via Bundlr
 * @param {*} bufferData
 * @returns Transaction ID (https://arweave.net/<id>)
 */
const uploadData = async (bufferData) => {
  const tags = [{ name: "Content-Type", value: "application/json" }];
  const transaction = bundlr.createTransaction(bufferData, { tags });
  await transaction.sign();
  const res = await transaction.upload();
  const id = res.data.id;
  return id;
};

/**
 * Upload file
 * @param {*} folderPath Local path to folder for upload
 * @returns Manifest ID if successful
 */
const uploadFile = async (filePath) => {
  await checkPriceAndFund(filePath);
  const res = await bundlr.uploader.uploadFile(filePath);
  const id = res.data.id;
  return id;
};

/**
 * Upload folder
 * @param {*} folderPath Local path to folder for upload
 * @returns Manifest ID if successful
 */
const uploadFolder = async (folderPath) => {
  await fundIfBelowThreshold(1e11, 1e11); // If balance below 0.1AR, fund 0.1AR
  try {
    const manifestID = await bundlr.uploader.uploadFolder(folderPath);
    return manifestID;
  } catch (e) {
    return console.error(e);
  }
};

module.exports = { uploadData, uploadFile, uploadFolder };
