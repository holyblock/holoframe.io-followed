require("dotenv").config({ path: "../.env" });
const ethers = require("ethers");
const fs = require("fs");
const { config } = require("hardhat");

const abiPath = `${__dirname}/../deployments/ropsten/HoloFactory.json`;
const parsed = JSON.parse(fs.readFileSync(abiPath));
const HoloFactoryABI = parsed.abi;

// Variables to change
const name = ""; // ex. "HoloPunks"
const symbol = ""; // ex. "HOLO"
const originAddr = ethers.constants.AddressZero;
const totalSupply = 10000;
const royaltyBPS = 0;
const factoryContractAddr = process.env.HOLO_FACTORY_ADDR; // Deployed factory contract address
// "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d";

if (!factoryContractAddr) {
  throw new Error("Factory contract address is undefined");
}

// Conditional variables (provider, account / private key)
let defaultProvider;
let accountOrKey;
if (config.defaultNetwork === "mainnet") {
  defaultProvider = "homestead";
  accountOrKey = process.env.MAINNET_DEPLOYER_PRIV_KEY;
} else if (config.defaultNetwork === "ropsten") {
  defaultProvider = "ropsten";
  accountOrKey = process.env.ROPSTEN_DEPLOYER_PRIV_KEY;
}

// Connect to the network
const provider = ethers.getDefaultProvider(defaultProvider);

// We connect to the Contract using a Provider, so we will only
// have read-only access to the Contract
const contract = new ethers.Contract(
  factoryContractAddr,
  HoloFactoryABI,
  provider
);

// const wallet = new ethers.Wallet(privateKey, provider);
const wallet = new ethers.Wallet(accountOrKey, provider);

// Create a new instance of the Contract with a Signer, which allows
// update methods
const contractWithSigner = contract.connect(wallet);
// ... OR ...
// let contractWithSigner = new Contract(contractAddress, abi, wallet)

// Set a new Value, which returns the transaction
(async () => {
  try {
    const tx = await contractWithSigner.createCollection(
      name,
      symbol,
      originAddr,
      totalSupply,
      royaltyBPS
    );
    console.log("TX Hash", tx.hash);

    // The operation is NOT complete yet; we must wait until it is mined
    await tx.wait();
  } catch (e) {
    console.log("Error", e);
  }
})();
