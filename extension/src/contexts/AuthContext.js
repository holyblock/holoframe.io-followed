import React, { useContext, useEffect, useState } from "react";
const { providers } = require("ethers");
const createProvider = require("metamask-extension-provider");
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";
import {
  INFURA_RPC_URL_MAINNET_HTTP,
  INFURA_RPC_URL_GOERLI_HTTP,
  INFURA_RPC_URL_ARBITRUM_HTTP,
} from "../utils/web3Config";
import mixpanel from "mixpanel-browser";
import localforage from "localforage";

const AuthContext = React.createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [injectedProvider, setInjectedProvider] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState("");

  const [tokenproofSession, setTokenproofSession] = useState(null);

  useEffect(() => {
    (async () => {
      chrome.storage.sync.get(
        ["walletType", "tokenproofSession"],
        async (res) => {
          if (res.walletType) {
            if (res.walletType === "tokenproof") {
              loginTokenproof(res.tokenproofSession);
            } else {
              connectWallet(res.walletType, true);
            }
          }
        }
      );
    })();
  }, []);

  const loginTokenproof = async (data) => {
    await chrome.storage.sync.set({
      walletType: "tokenproof",
      tokenproofSession: data,
    });
    setTokenproofSession(data);
    setIsAuthenticated(true);
    setUserAddress(data.account);

    // Track user analytics
    mixpanel.identify(data.account);
    mixpanel.people.set({ "Wallet Type": "tokenproof" });
    mixpanel.register_once({
      "First Login Date": new Date().toISOString(),
    });
    mixpanel.track("Login");
  };

  const connectWallet = async (walletType, cached) => {
    let provider;
    switch (walletType) {
      case "injected": {
        try {
          provider = createProvider();
        } catch (e) {
          console.log("Error", e);
          throw new Error(
            "There was an error connecting to your Metamask wallet."
          );
        }
        break;
      }
      case "walletconnect": {
        const providerOptions = {
          walletconnect: {
            display: {
              logo: "https://hologramxyz.s3.amazonaws.com/logo.png",
              name: "Hologram",
              description: "Scan QR code with your mobile wallet.",
            },
            package: WalletConnectProvider, // required
            options: {
              bridge: "https://polygon.bridge.walletconnect.org",
              rpc: {
                1: INFURA_RPC_URL_MAINNET_HTTP, // mainnet // For more WalletConnect providers: https://docs.walletconnect.org/quick-start/dapps/web3-provider#required
                5: INFURA_RPC_URL_GOERLI_HTTP,
                42161: INFURA_RPC_URL_ARBITRUM_HTTP
              },
            },
          },
        };
        const web3Modal = new Web3Modal({
          network: "mainnet", // optional
          cacheProvider: false, // optional
          disableInjectedProvider: true,
          providerOptions, // required
        });

        try {
          provider = await web3Modal.connectTo("walletconnect");
        } catch (e) {
          console.log("Error", e);
          throw new Error(
            "There was an error connecting to your WalletConnect wallet."
          );
        }
        break;
      }
    }
    // Handle metamask login
    if (provider) {
      setProvider(provider);
      if (walletType === "injected") {
        // Already logged into Hologram, but Metamask is locked
        const isUnlocked = await provider._metamask.isUnlocked();
        if (!isUnlocked) {
          return setWarning("Please open Metamask and login first.");
        }
      }
      updateProvider(provider, walletType);
    }
  };

  const updateProvider = async (provider, walletType) => {
    setLoading(true);
    setWarning("");
    await provider.enable();
    const injectedProvider = new providers.Web3Provider(provider);
    setInjectedProvider(injectedProvider);

    // Get user address
    let address;
    const signer = await injectedProvider.getSigner();
    try {
      address = await signer.getAddress();
      setUserAddress(address);
    } catch (e) {
      console.error("Error getting address", e);
    }

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logout();
    });

    // Store provider in chrome local storage
    if (address && !isAuthenticated) {
      await chrome.storage.sync.set({ walletType: walletType });
      setIsAuthenticated(true);
      setLoading(false);

      // Track user analytics
      mixpanel.identify(address);
      mixpanel.people.set({ "Wallet Type": walletType });
      mixpanel.register_once({
        "First Login Date": new Date().toISOString(),
      });
      mixpanel.track("Login");
    }
  };

  const switchAccount = async () => {
    if (!provider) return;
    const address = await provider
      .request({
        method: "wallet_requestPermissions",
        params: [
          {
            eth_accounts: {},
          },
        ],
      })
      .then(async (permissions) => {
        const signer = await injectedProvider.getSigner();
        const address = await signer.getAddress();
        return address;
      });

    setUserAddress(address);
    await localforage.clear();
  };

  const logout = async () => {
    setLoading(true);
    if (
      injectedProvider &&
      injectedProvider.provider &&
      typeof injectedProvider.provider.disconnect == "function"
    ) {
      await injectedProvider.provider.disconnect();
    }
    setInjectedProvider(null);
    setUserAddress(null);
    setTokenproofSession(null);
    setIsAuthenticated(false);

    // Remove local storage cache
    await chrome.storage.sync.clear();
    await localforage.clear();
    setLoading(false);

    // Tell content script to disable model
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, {
          type: "logout",
        });
      });
    });

    mixpanel.register("Logout");
    mixpanel.reset();
  };

  const value = {
    connectWallet,
    userAddress,
    isAuthenticated,
    switchAccount,
    logout,
    warning,
    loginTokenproof,
    setTokenproofSession,
    tokenproofSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
