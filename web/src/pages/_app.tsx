import "../styles/globals.css";
import type { AppProps } from "next/app";
import Script from "next/script";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "../styles/theme";
import { MoralisProvider } from "react-moralis";
import { createClient, WagmiConfig, chain, configureChains } from "wagmi";
import { mAppId, mServerUrl, iRpcKey } from "../../settings";
import AuthProvider from "../contexts/AuthContext";

import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

/**
 * Initialize wagmi
 */
// Configure chains & providers with the Alchemy provider.
// Two popular providers are Alchemy (alchemy.com) and Infura (infura.io)
const { chains, provider, webSocketProvider } = configureChains(
  [chain.mainnet, chain.arbitrum, chain.goerli],
  [infuraProvider({ apiKey: iRpcKey! }), publicProvider()]
);

const client = createClient({
  connectors: [
    new MetaMaskConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true,
      },
    }),
  ],
  provider,
  webSocketProvider,
});

function MyApp({ Component, pageProps }: AppProps) {
  const MainComponent = Component as any;
  return (
    <MoralisProvider appId={mAppId!} serverUrl={mServerUrl!}>
      <ChakraProvider theme={theme}>
        <WagmiConfig client={client}>
          <AuthProvider>
            <Script
              src="/live2dcubismcore.min.js"
              type="text/javascript"
              strategy="beforeInteractive"
            />
            <Script
              src="/live2d.min.js"
              type="text/javascript"
              strategy="beforeInteractive"
            />
            <MainComponent {...pageProps} />
          </AuthProvider>
        </WagmiConfig>
      </ChakraProvider>
    </MoralisProvider>
  );
}

export default MyApp;
