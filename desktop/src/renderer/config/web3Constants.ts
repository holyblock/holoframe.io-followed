import ethereumLogo from '../../../assets/img/ethereum.svg';
import arbitrumLogo from '../../../assets/img/arbitrum.svg';

const MAINNET_CHAIN_ID = 1;
const GOERLI_CHAIN_ID = 5;
const ARBITRUM_CHAIN_ID = 42161;

export const CHAIN_IDS = {
  MAINNET: MAINNET_CHAIN_ID,
  GOERLI: GOERLI_CHAIN_ID,
  ARBITRUM: ARBITRUM_CHAIN_ID,
};

export const CHAIN_NAMES_BY_ID = {
  1: 'eth',
  5: 'goerli',
  42161: 'arbitrum',
};

export const MULTICHAIN_OPTIONS = [
  { value: 'eth', label: 'Mainnet', icon: ethereumLogo },
  { value: 'arbitrum', label: 'Arbitrum', icon: arbitrumLogo },
];

const infuraRpcKey = '888f0fdad41c44a1b0c3661fb833aade';
export const DEFAULT_CHAIN_ID = CHAIN_IDS.MAINNET;
export const INFURA_RPC_URL_MAINNET_HTTP = `https://mainnet.infura.io/v3/${infuraRpcKey}`;
export const INFURA_RPC_URL_GOERLI_HTTP = `https://goerli.infura.io/v3/${infuraRpcKey}`;
export const INFURA_RPC_URL_ARBITRUM_HTTP = `https://arbitrum-mainnet.infura.io/v3/${infuraRpcKey}`;

export const RPC_POLLING_INTERVAL = 8000;

export const SUPPORTED_CHAIN_IDS = [CHAIN_IDS.MAINNET];

export const SUPPORTED_CHAIN_IDS_PRODUCTION = [CHAIN_IDS.MAINNET];

export const SUPPORTED_CHAIN_TESTNET = [CHAIN_IDS.GOERLI];
