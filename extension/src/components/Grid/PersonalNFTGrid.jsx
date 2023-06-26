import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Text,
  Fade,
  Flex,
  SimpleGrid,
  Spinner,
} from "@chakra-ui/react";

import config from "../../config/constants";
import { getChromeCache } from "../../utils/chromeAPIHelper";
import { colors } from "../../utils/theme";
import HologramsRenderer from "./renderers/HologramsRenderer";
import BackgroundsRenderer from "./renderers/BackgroundsRenderer";
import NftsRenderer from "./renderers/NftsRenderer";
import { useNFTGrid } from "./contexts/NFTGridContext";
import { theme } from "../../utils/theme";

// Presentational grid for selecting user's 3D NFTs
/**
 * Example NFT object
 * {
 *   amount: "1"
 *   block_number: "12587815"
 *   block_number_minted: "12587815"
 *   contract_type: "ERC721"
 *   frozen: 0
 *   is_valid: 0
 *   metadata: null
 *   name: ""
 *   owner_of: "0x5e765c6a318502ff2f6ef0d951e84f8dae7fa3c9"
 *   symbol: ""
 *   synced_at: null
 *   syncing: 0
 *   token_address: "0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85"
 *   token_id: "94710427710198753088249520042020640315509234061934936619367399988442945970741"
 *   token_uri: null
 * }
 */
const PersonalNFTGrid = ({ nfts, paginate, displayLoading, onItemClick }) => {
  const {
    selectedHologram,
    setSelectedHologram,
    selectedBackground,
    setSelectedBackground,
  } = useNFTGrid();
  const [view, setView] = useState("Hologram"); // All, Hologram, NFT
  const [holograms, setHolograms] = useState([]);
  const [backgrounds, setBackgrounds] = useState([]);
  const [render, setRender] = useState(0);
  const loader = useRef(null);
  const [loading, setLoading] = useState(displayLoading);

  useEffect(() => {
    setLoading(displayLoading);
  }, [displayLoading]);

  // Categorize NFTs into holograms, backgrounds, etc
  useEffect(() => {
    setHolograms([]);
    setBackgrounds([]);

    let currHolograms = [];
    let currBackgrounds = [];
    for (let nft of nfts) {
      if (nft?.model_url && config.nfts.supportedTypes.includes(nft?.type)) {
        currHolograms.push(nft);
      } else {
        currBackgrounds.push(nft);
      }
    }
    setHolograms(currHolograms);
    setBackgrounds(currBackgrounds);
  }, [nfts]);

  // Init intersection observer for infinite scrolling
  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 0,
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loader.current) observer.observe(loader.current);
  }, []);

  // Intersection observer handler
  const handleObserver = useCallback(async (entries) => {
    const target = entries[0];
    if (target.isIntersecting) {
      await paginate();
    }
  }, []);

  // Set pre-selected view if there exists any
  useEffect(() => {
    chrome.storage.sync.get(["collectibleView"], async (res) => {
      if (res.collectibleView) {
        setView(res.collectibleView);
      }
    });
  }, []);

  // Get cached model if there exists any, otherwise autoselect first model
  useEffect(() => {
    (async () => {
      chrome.storage.sync.get(
        ["modelBackground", "backgroundType", "nftID"],
        async (res) => {
          if (res.modelBackground && res.backgroundType) {
            if (res.backgroundType === "nft") {
              setSelectedBackground({
                id: res.nftID,
              });
            }
          }
        }
      );
      if (!selectedHologram) {
        const cachedModel = await getChromeCache("cachedModel");
        if (cachedModel) {
          setSelectedHologram(cachedModel);
        } else if (holograms.length > 0) {
          const initialModelMetadata = holograms[0];
          const initialSelectedHologram = {
            id: `${initialModelMetadata.name}-${initialModelMetadata.id}`,
            type: initialModelMetadata.type,
            dataURL: initialModelMetadata.model_url,
            project: initialModelMetadata.project,
          };
          setSelectedHologram(initialSelectedHologram); // Display selection on UI
          // Tell content script to initialize autoselected model
          chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
              chrome.tabs.sendMessage(tab.id, {
                type: "initial_avatar_selection",
                initialSelectedHologram: initialSelectedHologram,
              });
            });
          });
        }
      }
    })();
  }, [nfts]);

  // Update condition to render NFT cards
  useEffect(() => {
    setRender(() => render + 1);
  }, [selectedHologram, nfts]);

  const onSelectView = async (view) => {
    setView(view);
    chrome.storage.sync.set({
      collectibleView: view,
    });
  };

  return (
    <Flex h="100%" w="100%" flexDir="column" alignItems="center">
      <Breadcrumb
        fontSize="sm"
        mt={2}
        mr={3}
        mb="10px"
        separator=""
        spacing={1}
        display="flex"
        w="100%"
        justifyContent="flex-end"
      >
        <BreadcrumbItem
          textDecoration={view === "All" && "underline"}
          textUnderlineOffset="6px"
        >
          <BreadcrumbLink onClick={() => onSelectView("All")}>
            All
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem
          textDecoration={view === "Hologram" && "underline"}
          textUnderlineOffset="6px"
        >
          <BreadcrumbLink onClick={() => onSelectView("Hologram")}>
            Holograms
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem
          textDecoration={view === "NFT" && "underline"}
          textUnderlineOffset="6px"
        >
          <BreadcrumbLink onClick={() => onSelectView("NFT")}>
            NFTs
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      {nfts.length > 0 ? (
        <Fade in={render}>
          <SimpleGrid
            columns={2}
            spacing={4}
            pb={4}
            px={1}
            background={theme.colors.brand.secondary}
            position="relative"
            zIndex={0}
          >
            {render && view === "All" && (
              <NftsRenderer
                nfts={nfts}
                onSelect={onItemClick}
                selectedHologram={selectedHologram}
                selectedBackground={selectedBackground}
              />
            )}
            {render && view === "Hologram" && (
              <HologramsRenderer
                holograms={holograms}
                selectedHologram={selectedHologram}
                onSelect={onItemClick}
              />
            )}
            {render && view === "NFT" && (
              <BackgroundsRenderer
                backgrounds={backgrounds}
                selectedBackground={selectedBackground}
                onSelect={onItemClick}
              />
            )}
          </SimpleGrid>
        </Fade>
      ) : loading ? (
        <Box
          h="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Spinner />
        </Box>
      ) : (
        <Box h="100%" display="flex" alignItems="center">
          <Text fontSize="md" textAlign="center">
            No holograms found.
            <Box
              color={colors.brand.primary}
              _hover={{
                cursor: "pointer",
                textDecor: "underline",
              }}
              onClick={() =>
                chrome.tabs.create({
                  active: true,
                  url: "https://hologram.xyz",
                })
              }
            >
              Get your first hologram.
            </Box>
          </Text>
        </Box>
      )}
      <Flex ref={loader} justifyContent="center" w="100%" h="30px" pb="30px">
        {loading && nfts.length > 5 && <Spinner />}
      </Flex>
    </Flex>
  );
};

export default PersonalNFTGrid;
