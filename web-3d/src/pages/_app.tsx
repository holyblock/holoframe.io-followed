import Header from '@/config';
import Dom from '@/components/layout/dom';
import '@/styles/index.css';
import dynamic from 'next/dynamic';
import { ThemeProvider } from '@chakra-ui/react';
import { theme } from '@/styles/theme';
import { CanvasProvider } from '@/contexts/CanvasContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { TrackingProvider } from '@/contexts/TrackingContext';
import { SettingProvider } from '@/contexts/SettingContext';
import {
  createClient,
  WagmiConfig,
  mainnet,
  goerli,
  configureChains,
} from 'wagmi';
import { aApiKey, mpToken } from '../../settings';
import mixpanel from 'mixpanel-browser'; // Analytics

import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { Suspense, useEffect, useState } from 'react';
import AvatarPedestal from '@/components/dom/Closet/AvatarPedestal';
import Loader from '@/components/Loader';

const { chains, provider, webSocketProvider } = configureChains(
  [mainnet, goerli],
  [alchemyProvider({ apiKey: aApiKey! }), publicProvider()]
);

const client = createClient({
  autoConnect: true,
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

const LCanvas = dynamic(() => import('@/components/layout/canvas'), {
  ssr: true,
});

function App({ Component, pageProps = { title: 'index' } }) {
  const [loadDom, setLoadDom] = useState(false);

  useEffect(() => {
    mixpanel.init(mpToken, { ip: false });
  });

  return (
    <>
      <Header title={pageProps.title} />
      <Suspense
        fallback={
          <Loader
            onFinished={() => {
              setLoadDom(true);
            }}
          />
        }
      >
        <Dom>
          <WagmiConfig client={client}>
            <ThemeProvider theme={theme}>
              <AuthProvider>
                <SettingProvider>
                  <CanvasProvider>
                    <TrackingProvider>
                      {loadDom && <Component {...pageProps} />}
                    </TrackingProvider>
                  </CanvasProvider>
                </SettingProvider>
              </AuthProvider>
            </ThemeProvider>
          </WagmiConfig>
        </Dom>
        {Component?.r3f && <LCanvas>{Component.r3f(pageProps)}</LCanvas>}
        {loadDom && <AvatarPedestal />}
      </Suspense>
    </>
  );
}

export default App;
