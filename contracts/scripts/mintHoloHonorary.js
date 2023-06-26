require("dotenv").config({ path: "../.env" });
const ethers = require("ethers");
const fs = require("fs");
const { config } = require("hardhat");

const abiPath = `${__dirname}/../deployments/ropsten/HoloHonorary.json`;
const parsed = JSON.parse(fs.readFileSync(abiPath));
const HoloHonoraryABI = parsed.abi;

// Variables to change
const tokenURI = ""; // https://arweave.net/...
const contractAddress = process.env.HOLO_HONORARY_ADDR; // Deployed contract address
const minterAddress = process.env.EOA_ADDR; // TP-Cold
// const contractAddress = "0xc82cD3a0a20c53b7A50065BBe6890d18790D1253"; // Deployed contract address
// const minterAddress = "0x7949Ae9C02a8815Abb876f93B0B3fD8F076055bd"; // TP-Cold

if (!contractAddress) {
  throw new Error("Honorary contract address is undefined");
} else if (!minterAddress) {
  throw new Error("Minter address is undefined");
} else if (!tokenURI) {
  throw new Error("Token URI is undefined");
}

// Conditional variables (provider, account / private key)
let defaultProvider;
let accountOrKey;
if (config.defaultNetwork === "mainnet") {
  defaultProvider = "homestead";
} else if (config.defaultNetwork === "ropsten") {
  defaultProvider = "ropsten";
  accountOrKey = process.env.ROPSTEN_DEPLOYER_PRIV_KEY;
}

// Connect to the network
const provider = ethers.getDefaultProvider(defaultProvider);

// We connect to the Contract using a Provider, so we will only
// have read-only access to the Contract
const contract = new ethers.Contract(
  contractAddress,
  HoloHonoraryABI,
  provider
);

// const wallet = new ethers.Wallet(privateKey, provider);
let wallet;
if (config.defaultNetwork === "mainnet") {
  const mnemonic = ethers.Wallet.fromMnemonic(
    config.networks.mainnet.accounts.mnemonic
  );
  wallet = new ethers.Wallet(mnemonic.privateKey, provider);
} else if (accountOrKey) {
  wallet = new ethers.Wallet(accountOrKey, provider);
} else {
  throw new Error("Neither mnemonic nor private key found during deployment");
}

// Create a new instance of the Contract with a Signer, which allows
// update methods

const contractWithSigner = contract.connect(wallet);
// ... OR ...
// const contractWithSigner = new ethers.Contract(
//   contractAddress,
//   HoloHonoraryABI,
//   wallet
// );

// Set a new Value, which returns the transaction
(async () => {
  try {
    const tx = await contractWithSigner.mint(minterAddress, tokenURI);
    // See: https://ropsten.etherscan.io/tx/0xaf0068dcf728afa5accd02172867627da4e6f946dfb8174a7be31f01b11d5364
    console.log("TX Hash", tx.hash);
    // "0xaf0068dcf728afa5accd02172867627da4e6f946dfb8174a7be31f01b11d5364"

    // The operation is NOT complete yet; we must wait until it is mined
    await tx.wait();
  } catch (e) {
    console.log("Error", e);
  }
})();
