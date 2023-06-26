import { useEffect, useState } from "react";

import CryptoJS from "crypto-js";
import { useRouter } from "next/router";
import Web3 from "web3";
import * as Web3Token from "web3-token";

import { Box, Container, Heading, Text } from "@chakra-ui/react";
import WalletConnectProvider from "@walletconnect/web3-provider";

import { authKey, iRpcKey } from "../../settings";
import CustomButton from "../components/Button";
import QRCodeScan from "../components/Modal/QRCodeScan";
import AppNavigationBar from "../components/NavigationBar/AppNavigationBar";
import AppFooter from "../components/NavigationFooter/AppFooter";
import { colors } from "../styles/theme";

const Auth = () => {
  const router = useRouter();
  const { platform, action, provider } = router.query;
  const [deeplink, setDeeplink] = useState("");
  let header = "Login to Hologram";
  switch (action) {
    case "switch_account":
      header = "Switch your account";
      break;
    case "switch_network":
      header = "Switch your network";
      break;
  }

  // Generate auth token or session with expiry and embed in deeplink
  useEffect(() => {
    (async () => {
      if (platform && action && provider && platform === "desktop") {
        let web3: any;
        let authToken: string = "";
        let address: string = "";
        // Metamask
        if (provider === "injected") {
          web3 = new Web3((window as any).ethereum);
          if (action === "switch_account") {
            await (window as any).ethereum.request({
              method: "wallet_requestPermissions",
              params: [{ eth_accounts: {} }],
            });
          }
          await (window as any).ethereum.request({
            method: "eth_requestAccounts",
          });
          address = (await web3.eth.getAccounts())[0];
          const domain =
            window.location.hostname === "localhost"
              ? "localhost.xyz"
              : window.location.hostname.split(".").slice(-2).join("."); // should be 'hologram.xyz'
          authToken = await Web3Token.sign(
            (msg) => web3.eth.personal.sign(msg, address),
            {
              expires_in: "7d",
              domain: domain,
            }
          );
        } else if (provider === "walletconnect") {
          //  Create WalletConnect Provider and enable session (triggers QR Code modal)
          const provider = new WalletConnectProvider({
            infuraId: iRpcKey,
          });
          const accounts = await provider.enable();
          address = accounts[0];

          // Get walletconnect's auth cache data from localstorage, base64 encode it
          const authCache = localStorage.getItem("walletconnect");
          if (authCache) {
            authToken = await Buffer.from(authCache).toString("base64");
          }
        }

        if (authToken && address) {
          const encryptedToken = CryptoJS.AES.encrypt(
            authToken,
            authKey
          ).toString();
          const deeplink = `hologram://${encryptedToken}?addr=${address}&provider=${provider}`;
          setDeeplink(deeplink);
          window.open(deeplink);
        }
      }
    })();
  }, [platform, action]);

  const handleTokenproofSession = async (session) => {
    const authToken = JSON.stringify(session);
    const encryptedToken = CryptoJS.AES.encrypt(authToken, authKey).toString();
    const deeplink = `hologram://${encryptedToken}?addr=${session.account}&provider=${provider}`;
    setDeeplink(deeplink);
    window.open(deeplink);
  };

  return (
    <Box>
      <AppNavigationBar />
      <Container minH="100vh" h="100%" maxW="container.md" textAlign="center">
        {platform && action && (
          <Heading pt="80px" size="xl">
            {header}
          </Heading>
        )}
        {deeplink ? (
          <Container maxW="xs" textAlign="center">
            <Text my="30px" as="h5" fontSize="lg">
              If nothing pops up, click below.
            </Text>
            <CustomButton
              text="Open the desktop app"
              variant="solid"
              selected
              // color="black"
              secondaryColor={colors.brand.primary}
              height="50px"
              onClick={() => window.open(deeplink)}
            />
          </Container>
        ) : provider !== "tokenproof" ? (
          <Text my="40px" as="h5" fontSize="lg">
            Open your Metamask and sign the message popup.
          </Text>
        ) : (
          !deeplink && <QRCodeScan onSuccess={handleTokenproofSession} />
        )}
      </Container>
      <AppFooter />
    </Box>
  );
};

export default Auth;
