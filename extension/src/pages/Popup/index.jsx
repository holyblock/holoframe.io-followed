import React from 'react';
import { render } from 'react-dom';
import { Web3Provider } from '@ethersproject/providers'
import { Web3ReactProvider } from '@web3-react/core';
import { ChakraProvider, ColorModeScript} from '@chakra-ui/react';
import { AuthProvider } from '../../contexts/AuthContext';
import { theme } from '../../utils/theme';

import Popup from './Popup';
import './Popup.css';

const getLibrary = (provider) => {
  const library = new Web3Provider(provider);
  return library;
};

render(
  <ChakraProvider theme={theme}>
    <Web3ReactProvider getLibrary={getLibrary}>
      <AuthProvider>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <Popup />
      </AuthProvider>
    </Web3ReactProvider>
  </ChakraProvider>, 
  window.document.querySelector('#app-container')
);

if (module.hot) module.hot.accept();