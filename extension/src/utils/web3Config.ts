import { CHAIN_IDS } from "./web3Constants";
import { iRpcKey } from "../../settings";

export const DEFAULT_CHAIN_ID = CHAIN_IDS.MAINNET;
export const INFURA_RPC_URL_MAINNET_HTTP = `https://mainnet.infura.io/v3/${iRpcKey}`;
export const INFURA_RPC_URL_ARBITRUM_HTTP = `https://arbitrum-mainnet.infura.io/v3/${iRpcKey}`;
export const INFURA_RPC_URL_GOERLI_HTTP = `https://goerli.infura.io/v3/${iRpcKey}`;

export const RPC_POLLING_INTERVAL = 8000;

export const SUPPORTED_CHAIN_IDS = [CHAIN_IDS.MAINNET];

export const SUPPORTED_CHAIN_IDS_PRODUCTION = [CHAIN_IDS.MAINNET];

export const SUPPORTED_CHAIN_TESTNET = [CHAIN_IDS.GOERLI];
