import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Box,
  Flex,
  Heading,
  IconButton,
  Spinner,
  Tooltip,
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import localforage from "localforage";
import { useCallbackRef } from "use-callback-ref";
import AudioModulator from "../Views/AudioModulator";
import NavBar from "../NavBar";
import Interactions from "./Interactions";
import Settings from "./Settings";
import { colors } from "../../utils/theme";
import { alchemyApi, ALCHEMY_NETWORK_MAP } from "../../../../utils/alchemyApi";
import { db, doc, getDoc } from "../../utils/clients/dbClient";
import config from "../../../../utils/config";

import { getModelFromMetadata } from "../../../../utils/helpers/assetHelper";
import { aApiKey } from "../../../settings";
import NFTGridProvider from "../Grid/contexts/NFTGridContext";
import NFTGrid from "../Grid/NFTGrid";

// Logged in home page
const HomePage = ({ network, showError, isTryFeatured }) => {
  const { userAddress } = useAuth();
  const [view, setView] = useState("avatars"); // Views: avatars, interactions, voice, settings
  const [loading, setLoading] = useState(false);
  const [paginating, setPaginating] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  const [, setCollectibles] = useState([]);
  const [, setHologramNFTs] = useState([]);
  const [, setBackgroundNFTs] = useState([]);

  const api = useRef();
  const pageKey = useRef(""); // Track last pagination position

  // Infinite scroll / dynamic loading
  const hologramNFTsRef = useCallbackRef([], (node) => setHologramNFTs(node));
  const backgroundNFTsRef = useCallbackRef([], (node) =>
    setBackgroundNFTs(node)
  );
  const collectiblesRef = useCallbackRef([], (node) => setCollectibles(node));
  const parsedTokenIDs = useRef(new Set()); // Ensure no duplicates
  const disablePagination = useRef(false);
  const totalNumNFTs = useRef(0);
  const retryRef = useRef(false); // Determines whether to keep retrying fetch NFTs
  const intervalID = useRef(null);
  const paginatingRef = useRef(false);

  // Attempt to fetch avatars from wallet
  useEffect(() => {
    (async () => {
      setLoading(true);
      pageKey.current = "";
      if (userAddress && network) {
        api.current = alchemyApi(aApiKey, network);

        // Check if NFTs already cached in session storage
        const cachedCollectibles = await localforage.getItem("collectibles");
        const cachedhologramNFTs = await localforage.getItem("hologramNFTs");
        const cachedBackgroundNFTs = await localforage.getItem(
          "backgroundNFTs"
        );
        if (cachedhologramNFTs && cachedBackgroundNFTs) {
          collectiblesRef.current = cachedCollectibles;
          hologramNFTsRef.current = cachedhologramNFTs;
          backgroundNFTsRef.current = cachedBackgroundNFTs;
          setLoading(false);
          disablePagination.current = true;
        } else {
          // No cache found, initial fetch of NFTs in user's wallet
          initializeFetchNFTLoop();
        }

        // Clear any running intervals if extension is switched off
        window.addEventListener("beforeunload", (event) => {
          if (intervalID.current) clearInterval(intervalID.current);
        });
      }
    })();
  }, [userAddress, network]);

  // Retry loop for querying Alchemy
  const initializeFetchNFTLoop = () => {
    const timeout = setInterval(async () => {
      await fetchNFTs();
      // Clear retry loop
      if (retryRef.current === false) {
        clearInterval(timeout);
        intervalID.current = null;
      }
    }, config.nfts.fetchTimeInMS);
    intervalID.current = timeout;
  };

  // Separate avatar NFTs from backgrounds
  const parseNFTs = async (allNFTs) => {
    for (let nft of allNFTs) {
      // Check for duplicates or add to set
      const uniqueNFTIdentifier = `${nft.contract.address}-${nft.id.tokenId}`;
      if (parsedTokenIDs.current.has(uniqueNFTIdentifier)) {
        continue;
      } else {
        parsedTokenIDs.current.add(uniqueNFTIdentifier);
      }

      const metadata = {
        ...nft.metadata,
        id: nft.id.tokenId,
        name: nft.title,
        description: nft.description,
      };
      if (!metadata.image) {
        metadata.image = nft.media[0]?.gateway;
      }

      // Check for Hologram compatibility (metadata type and model_url)
      if (
        config.nfts.supportedTypes.includes(metadata?.type) &&
        metadata?.model_url
      ) {
        hologramNFTsRef.current = [...hologramNFTsRef.current, metadata];
      } else {
        backgroundNFTsRef.current = [...backgroundNFTsRef.current, metadata];
      }

      // Partner-project whitelist
      const partnerProjectsConfig = config.partners[network] ?? {};
      if (!nft.contractMetadata) return;
      const { symbol } = nft.contractMetadata;
      if (Object.keys(partnerProjectsConfig).includes(symbol)) {
        const partnerConfig = config.partners[network][symbol];
        let verified = false; // whether hologram is verified

        // Check if partner collection required user claiming
        if (partnerConfig.needClaim) {
          // Check db to verify holder claimed
          const networkName = ALCHEMY_NETWORK_MAP[network];
          const tokenRef = doc(
            db,
            'NFTs',
            networkName,
            symbol,
            `${Number(metadata.id)}`
          );
          const tokenSnap = await getDoc(tokenRef);
          if (tokenSnap.exists()) {
            const tokenData = tokenSnap.data();
            // If holder claimed, enable access to this hologram
            if (tokenData.claimed) {
              verified = true;
            }
          }
        } else {
          // Partner hologram didn't need claim, automatically verified
          verified = true;
        }
        
        if (verified) {
          const modelURL = getModelFromMetadata(
            partnerConfig.standard,
            network,
            nft
          );
          metadata.type = partnerConfig.type;
          metadata.model_url = modelURL;
          metadata.project = symbol;
        }
      }
      collectiblesRef.current = [...collectiblesRef.current, metadata];
    }
  };

  // Fetch next batch of NFTs
  const fetchNFTs = async () => {
    if (!api.current || !userAddress) return;
    try {
      const searchParams = new URLSearchParams();
      searchParams.append("owner", userAddress);
      searchParams.append("withMetadata", "true");
      if (pageKey.current) {
        searchParams.append("pageKey", pageKey.current);
      }
      const { data } = await api.current.get(
        `getNFTs?${searchParams.toString()}`
      );
      const { pageKey: newPageKey, ownedNfts, totalCount } = data;

      // Reset if response shows updated total number of NFTs
      if (totalNumNFTs.current !== totalCount) {
        totalNumNFTs.current = totalCount;
        parsedTokenIDs.current = new Set();
        setPaginating(true);
        // Populate new raw NFT data
        retryRef.current = true;
        if (!intervalID.current) initializeFetchNFTLoop();
      }

      // Parse NFT and track previous pagination position
      await parseNFTs(ownedNfts);
      pageKey.current = newPageKey;

      if (!newPageKey) {
        // All NFTs have been loaded
        setPaginating(false);
        retryRef.current = false;
        await localforage.setItem("collectibles", collectiblesRef.current);
        await localforage.setItem("hologramNFTs", hologramNFTsRef.current);
        await localforage.setItem("backgroundNFTs", backgroundNFTsRef.current);
      }
      setLoading(false);
    } catch (e) {
      console.error(e);
      // showError("There was an issue getting your NFTs.");
      setLoading(false);
    }
  };

  // Load next batch of NFTs
  const paginate = async () => {
    if (
      disablePagination.current === false &&
      paginatingRef.current === false
    ) {
      paginatingRef.current = true;
      await fetchNFTs();
      paginatingRef.current = false;
    }
  };

  // Manual refetch all NFT data
  const onRefresh = async () => {
    if (refreshed) return;

    // Remove cached NFTs and reset state
    await localforage.removeItem("hologramNFTs");
    await localforage.removeItem("backgroundNFTs");
    pageKey.current = undefined;
    retryRef.current = true;
    disablePagination.current = false;
    if (parsedTokenIDs.current.size === 0) {
      collectiblesRef.current = [];
      hologramNFTsRef.current = [];
      backgroundNFTsRef.current = [];
    }
    setLoading(true);
    initializeFetchNFTLoop();
    setRefreshed(true);
  };
  const onSetEnabled = (isEnabled) => {
    setEnabled(isEnabled);
  };

  return (
    <Flex
      h="100%"
      w="100%"
      flexDir="column"
      justifyContent="space-between"
      alignItems="center"
    >
      {isTryFeatured ? (
        <>
          <Box>
            <Heading as="h1" size="md">
              Featured Collectibles
            </Heading>
          </Box>
          <Box
            id="scroll-container"
            h="100%"
            w="100%"
            pb="50px"
            pointerEvents={enabled ? "all" : "none"}
            opacity={enabled ? 1 : 0.5}
            overflow="scroll"
            top="0"
            css={{
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            {view === "avatars" && (
              <NFTGridProvider>
                <NFTGrid
                  nfts={collectiblesRef.current}
                  paginate={paginate}
                  displayLoading={paginating}
                  isTryFeatured
                />
              </NFTGridProvider>
            )}
            {view === "interactions" && <Interactions />}
            {view === "voice" && <AudioModulator />}
            {view === "settings" && <Settings />}
          </Box>
          <NavBar
            onSelect={setView}
            enabled={enabled}
            setEnabled={onSetEnabled}
          />
        </>
      ) : (
        <>
          <Box>
            <Heading as="h2" size="md">
              {view === "avatars" && "Collectibles"}
              {view === "interactions" && "Hologram"}
              {view === "voice" && "Voice"}
              {view === "settings" && "Settings"}
            </Heading>
            <Tooltip label="Refresh" pt={-2}>
              <IconButton
                disabled={refreshed}
                pos="fixed"
                top="4px"
                right={3}
                size="lg"
                variant="unstyled"
                icon={<RepeatIcon />}
                onClick={onRefresh}
                _hover={{
                  color: !refreshed ? colors.brand.primary : "inherit",
                }}
              />
            </Tooltip>
          </Box>
          <Box
            id="scroll-container"
            h="100%"
            w="100%"
            pb="50px"
            pointerEvents={enabled ? "all" : "none"}
            opacity={enabled ? 1 : 0.5}
            overflow="scroll"
            top="0"
            css={{
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            {loading && (
              <Box
                h="100%"
                display="flex"
                justifyContent="center"
                alignItems="center"
                mb="20px"
              >
                <Spinner />
              </Box>
            )}
            {view === "avatars" && (
              <NFTGridProvider>
                <NFTGrid
                  nfts={collectiblesRef.current}
                  paginate={paginate}
                  displayLoading={paginating}
                />
              </NFTGridProvider>
            )}
            {view == "interactions" && <Interactions />}
            {view === "voice" && <AudioModulator />}
            {view === "settings" && <Settings />}
          </Box>
          <NavBar
            onSelect={setView}
            enabled={enabled}
            setEnabled={onSetEnabled}
          />
        </>
      )}
    </Flex>
  );
};

export default HomePage;
