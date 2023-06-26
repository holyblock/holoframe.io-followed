import axios from "axios";

const ALCHEMY_NETWORK_MAP = {
  1: "eth-mainnet",
  5: "eth-goerli",
  42161: "arb-mainnet",
  eth: "eth-mainnet",
  goerli: "eth-goerli",
  arbitrum: "arb-mainnet",
};

export function alchemyApi(apiKey: string, networkId: number | string) {
  const alchemyNetwork = ALCHEMY_NETWORK_MAP[networkId];
  const baseURL = `https://${alchemyNetwork}.g.alchemy.com/nft/v2/${apiKey}`;
  const api = axios.create({
    method: "GET",
    baseURL,
  });

  return api;
}
