import axios from "axios";

export const ALCHEMY_NETWORK_MAP: any = {
  1: "eth-mainnet",
  5: "eth-goerli",
  42161: "arb-mainnet",
  eth: "eth-mainnet",
  goerli: "eth-goerli",
  arbitrum: "arb-mainnet",
};

export const alchemyApi = (apiKey: string, networkId: number | string) => {
  const alchemyNetwork = ALCHEMY_NETWORK_MAP[networkId];
  const baseURL = `https://${alchemyNetwork}.g.alchemy.com/nft/v2/${apiKey}`;
  const api = axios.create({
    method: "GET",
    baseURL,
  });

  return api;
};