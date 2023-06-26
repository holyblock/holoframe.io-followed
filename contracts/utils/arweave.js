const Arweave = require("arweave");
const TestWeave = require("testweave-sdk");
const assets = require("./honoraryAssetURIs.json");
const config = require("./config.js");
require("dotenv").config();

const DATA = JSON.stringify(assets[0]);

// Arweave script for uploading local assets
(async () => {
  // Initialize Arweave Client
  const arweaveConfig =
    process.env.NODE_ENV === "dev" ? config.arweave.dev : config.arweave.prod;
  const arweave = Arweave.init({
    host: arweaveConfig.host,
    port: arweaveConfig.port,
    protocol: arweaveConfig.protocol,
  });
  let key;
  if (process.env.NODE_ENV === "dev") {
    const testWeave = await TestWeave.init(arweave);
    key = testWeave.rootJWK;
  } else {
    try {
      const encodedKey = Buffer.from(
        process.env.ARWEAVE_KEY_ENCODED_BASE64,
        "base64"
      );
      key = JSON.parse(encodedKey.toString("ascii"));
    } catch (e) {
      console.error(e);
    }
  }

  // Post transaction
  try {
    // Upload to Arweave
    const dataTransaction = await arweave.createTransaction(
      { data: DATA },
      key
    );

    // Sign transaction
    await arweave.transactions.sign(dataTransaction, key);
    const statusBeforePost = await arweave.transactions.getStatus(
      dataTransaction.id
    );
    console.log(statusBeforePost); // this will return 404

    await arweave.transactions.post(dataTransaction);
    const statusAfterPost = await arweave.transactions.getStatus(
      dataTransaction.id
    );
    console.log(statusAfterPost); // this will return 202
  } catch (e) {
    console.error("Post error", e);
  }
})();
