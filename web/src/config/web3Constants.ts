import { BigNumber, utils } from "ethers";

const MAINNET_CHAIN_ID = 1;
const GOERLI_CHAIN_ID = 5;

export const CHAIN_IDS = {
  MAINNET: MAINNET_CHAIN_ID,
  GOERLI: GOERLI_CHAIN_ID,
};

export const MORALIS_CHAIN_NAMES_BY_ID = {
  1: "eth",
  5: "goerli",
};

export const UI_CHAIN_NAMES_BY_ID = {
  1: "Ethereum",
  5: "Goerli",
};

export const ETHERSCAN_ROOT_URL_BY_CHAIN = {
  1: "https://etherscan.io",
  5: "https://goerli.etherscan.io",
};

export const bigNumberToNumber = (bn: BigNumber) => {
  return +bn.toString();
};

export const bigNumberToEth = (bn: BigNumber) => {
  return Number(utils.formatEther(bn));
};
