import React, { useEffect, useState } from "react";
import mixpanel from "mixpanel-browser"; // Analytics
import { useAuth } from "../../contexts/AuthContext";
import Welcome from "../../components/Views/Welcome";
import HomePage from "../../components/Views/HomePage";
import WalletSelect from "../../components/WalletSelect";
import NetworkSelect from "../../components/NetworkSelect";
import {
  Alert,
  AlertIcon,
  AlertDescription,
  CloseButton,
  Container,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  useDisclosure,
} from "@chakra-ui/react";
import {
  HamburgerIcon,
  LockIcon,
  UnlockIcon,
  RepeatIcon,
  ArrowBackIcon,
} from "@chakra-ui/icons";
import ethereumLogo from "../../assets/img/ethereum.svg";
import { mpToken } from "../../../settings";
import { colors } from "../../utils/theme";
import TokenproofModal from "../../components/TokenproofModal";

const NETWORK_NAMES = {
  eth: "Mainnet",
  goerli: "Goerli",
  arbitrum: "Arbitrum",
};

const Popup = () => {
  const [connectWalletOpen, setConnectWalletOpen] = useState(false);
  const [selectNetworkOpen, setSelectNetworkOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [view, setView] = useState("welcome"); // Views: welcome, wallet, home, network
  const {
    isAuthenticated,
    switchAccount,
    logout,
    warning,
    tokenproofSession,
    setTokenproofSession,
  } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    // Enable mixpanel analytics
    mixpanel.init(mpToken, { ip: false });
    // Initialize listener for errors coming from content script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.error) {
        setError(request.error);
      }
      sendResponse({ ack: true });
    });
    // Check for cached network selection
    chrome.storage.sync.get("currentNetwork", async (res) => {
      if (res.currentNetwork) {
        setSelectedNetwork(res.currentNetwork);
      } else {
        // Set default network to eth mainnet
        setSelectedNetwork("eth");
      }
    });
  }, []);

  // Listen and display info
  useEffect(() => {
    setInfo("");
    if (warning) {
      setInfo(warning);
    }
  }, [warning]);

  // Switch views
  useEffect(() => {
    if (!isAuthenticated) {
      if (!connectWalletOpen) {
        setView("welcome");
      } else {
        setView("wallet");
      }
    } else {
      if (!selectNetworkOpen) {
        setView("home");
      } else {
        setView("network");
      }
    }
  }, [isAuthenticated, connectWalletOpen, selectNetworkOpen]);

  const onLogout = () => {
    logout();
    setView("welcome");
  };

  const showError = (error) => {
    setError(error);
  };

  return (
    <Container
      h="540px"
      w="360px"
      paddingTop={4}
      paddingBottom={8}
      maxW="container.xl"
      className="App-header"
    >
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Options"
          icon={<HamburgerIcon />}
          variant="ghost"
          position="fixed"
          _hover={{ opacity: 0.6 }}
          left={2}
          top={2}
        />
        <MenuList>
          {/* <MenuItem 
            color="black" 
            icon={<ExternalLinkIcon />}
          >
            <LinkOverlay 
              isExternal 
              href="https://rolling.ai"
              onClick={() => {
                window.open('https://support.wwf.org', "_blank")
              }}
            >
              About Hologram
            </LinkOverlay>
          </MenuItem> */}
          {isAuthenticated ? (
            <>
              <MenuItem
                color="black"
                icon={<img width="8px" src={ethereumLogo} alt="ethereum" />}
                onClick={() => setSelectNetworkOpen(true)}
              >
                Switch network ({NETWORK_NAMES[selectedNetwork]})
              </MenuItem>
              <MenuItem
                color="black"
                onClick={() => {
                  if (tokenproofSession) {
                    setTokenproofSession(null);
                    onOpen();
                  } else {
                    switchAccount();
                  }
                }}
                icon={<RepeatIcon />}
              >
                Switch account
              </MenuItem>
              <MenuItem color="black" icon={<LockIcon />} onClick={onLogout}>
                Log out
              </MenuItem>
            </>
          ) : (
            <>
              {view === "featured" && (
                <MenuItem
                  color="black"
                  icon={<ArrowBackIcon />}
                  onClick={() => setView("welcome")}
                >
                  Back
                </MenuItem>
              )}
              <MenuItem
                color="black"
                icon={<UnlockIcon />}
                onClick={() => setConnectWalletOpen(true)}
              >
                Switch network ({NETWORK_NAMES[selectedNetwork]})
              </MenuItem>
            </>
          )}
        </MenuList>
      </Menu>
      {view === "welcome" && (
        <Welcome
          onConnect={() => setConnectWalletOpen(true)}
          onTryFeatured={() => setView("featured")}
        />
      )}
      {view === "wallet" && (
        <WalletSelect
          onBack={() => setConnectWalletOpen(false)}
          showError={showError}
        />
      )}
      {view === "network" && (
        <NetworkSelect
          network={selectedNetwork}
          setNetwork={setSelectedNetwork}
          onBack={() => setSelectNetworkOpen(false)}
        />
      )}
      {(view === "home" || view === "featured") && (
        <HomePage
          network={selectedNetwork}
          showError={showError}
          isTryFeatured={view === "featured"}
        />
      )}
      {info && (
        <Flex justifyContent="center" w="100vw">
          <Alert
            status="info"
            bgColor={colors.brand.primary}
            height="50px"
            pos="absolute"
            bottom="22px"
            left={0}
          >
            <AlertIcon color="black" />
            <AlertDescription fontSize="md" textColor="black">
              {info}
            </AlertDescription>
          </Alert>
        </Flex>
      )}
      {error && (
        <div>
          <Alert status="error">
            <AlertIcon />
            <AlertDescription textColor="black">{error}</AlertDescription>
            <CloseButton
              position="absolute"
              right="0px"
              top="6px"
              color="black"
              onClick={() => setError("")}
            />
          </Alert>
        </div>
      )}
      <TokenproofModal isOpen={isOpen} onClose={onClose} />
    </Container>
  );
};

export default Popup;
