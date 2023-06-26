import React, { useContext, useEffect, useState } from 'react';

import CryptoJS from 'crypto-js';
import { ipcRenderer } from 'electron';
import localforage from 'localforage';
import mixpanel from 'mixpanel-browser';
import { useMoralis } from 'react-moralis';
import { authKey } from 'renderer/settings';
import * as Web3Token from 'web3-token';

const ROOT_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://hologram.xyz';

const AuthContext = React.createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [userAddress, _setUserAddress] = useState(null);
  const [isAuthenticated, _setIsAuthenticated] = useState(false);
  const [provider, _setProvider] = useState('');
  const [network, _setNetwork] = useState('eth');
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState('');
  const { account, enableWeb3 } = useMoralis();

  useEffect(() => {
    (async () => {
      // Check existing authentication tokens / cache
      const encryptedMetamaskAuthToken: string = await localforage.getItem(
        'authToken'
      );
      const encryptedTokenproofSession: string = await localforage.getItem(
        'tokenproofSession'
      );
      if (encryptedMetamaskAuthToken) {
        await authenticate('injected', encryptedMetamaskAuthToken);
      } else if (encryptedTokenproofSession) {
        await authenticate('tokenproof', encryptedTokenproofSession);
      } else {
        const wcAuthData = localStorage.getItem('walletconnect');
        if (wcAuthData) {
          // Check for walletconnect login cache
          await authenticate('walletconnect', '');
        }
      }

      const cachedNetwork: string = await localforage.getItem('network');
      if (cachedNetwork) {
        _setNetwork(cachedNetwork);
      }

      // Initiate listener on auth requests
      ipcRenderer.on('auth', async (evt, message) => {
        if (message.provider === 'injected') {
          // Metamask auth + store encrypted auth token in localstorage
          await authenticate('injected', message.token);
          await localforage.setItem('authToken', message.token);
        } else if (message.provider === 'walletconnect') {
          await authenticate('walletconnect', message.token);
          _setUserAddress(message.addr);
        } else if (message.provider === 'tokenproof') {
          await localforage.setItem('tokenproofSession', message.token);
          await authenticate('tokenproof', message.token);
        }
      });
    })();
  }, []);

  useEffect(() => {
    if (userAddress || account) {
      _setIsAuthenticated(true);
      if (account) {
        _setUserAddress(account);
      }
      // Track user login
      mixpanel.identify(userAddress);
      mixpanel.register_once({
        'First Login Date': new Date().toISOString(),
      });
      mixpanel.track('Login');
    } else {
      _setIsAuthenticated(false);
      _setProvider('');
    }
  }, [userAddress, account]);

  // Helper function to authenticate user based on token and provider
  const authenticate = async (
    authProvider: string,
    encryptedToken?: string
  ) => {
    let unencryptedToken = '';
    if (encryptedToken) {
      // Decrypt token for authentication
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedToken, authKey);
      unencryptedToken = decryptedBytes.toString(CryptoJS.enc.Utf8);
    }
    // Metamask
    if (authProvider === 'injected') {
      try {
        // Verify token with origin domain restrictions
        const { address, body } = await Web3Token.verify(unencryptedToken, {
          domain:
            process.env.NODE_ENV === 'development'
              ? 'localhost.xyz'
              : 'hologram.xyz',
        });
        _setUserAddress(address);
        _setProvider('injected');
      } catch (e) {
        console.error(e);
        // Remove auth token cache if expired
        if (e.message?.includes('Token expired')) {
          await localforage.removeItem('authToken');
          await localforage.removeItem('supportedNFTs');
          await localforage.removeItem('backgroundNFTs');
        }
      }
      // Wallet Connect
    } else if (authProvider === 'walletconnect') {
      // Wallet Connect expects localstorage to have unencrypted auth data
      if (!localStorage.getItem('walletconnect') && unencryptedToken) {
        const authCache = window.atob(unencryptedToken);
        localStorage.setItem('walletconnect', authCache);
      }

      // Enable web3 via Moralis
      await enableWeb3({ provider: 'walletconnect' });
      _setProvider('walletconnect');
    } else if (authProvider === 'tokenproof') {
      const session = JSON.parse(unencryptedToken);
      _setUserAddress(session.account);

      // Enable web3 via Moralis
      await enableWeb3();
      _setProvider('tokenproof');
    }
  };

  const setUserAddress = (addr: string) => {
    _setUserAddress(addr);
  };

  const connectWallet = async (walletType): Promise<void> => {
    let loginLink = `${ROOT_URL}/auth?platform=desktop&action=login`;
    if (walletType === 'walletconnect') {
      loginLink += '&provider=walletconnect';
    } else if (walletType === 'injected') {
      loginLink += '&provider=injected';
    } else if (walletType === 'tokenproof') {
      loginLink += '&provider=tokenproof';
    }
    window.open(loginLink, '_blank');
  };

  const switchAccount = async () => {
    window.open(
      `${ROOT_URL}/auth?platform=desktop&action=switch_account&provider=injected`,
      '_blank'
    );
    await localforage.clear();
  };

  const setNetwork = (currNetwork: string) => {
    _setNetwork(currNetwork);
    localforage.setItem('network', currNetwork);
  };

  const setProvider = (currProvider: string) => {
    _setProvider(currProvider);
  };

  const setIsAuthenticated = async (authenticated: boolean) => {
    _setIsAuthenticated(authenticated);
  };

  const logout = async () => {
    setLoading(true);
    setUserAddress(null);
    _setIsAuthenticated(false);
    _setProvider('');

    // Remove local storage cache
    await localforage.clear();
    localStorage.clear();
    setLoading(false);
    window.location.reload();

    mixpanel.register('Logout');
    mixpanel.reset();
  };

  const value = {
    connectWallet,
    userAddress,
    setUserAddress,
    provider,
    setProvider,
    isAuthenticated,
    setIsAuthenticated,
    switchAccount,
    network,
    setNetwork,
    logout,
    warning,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
