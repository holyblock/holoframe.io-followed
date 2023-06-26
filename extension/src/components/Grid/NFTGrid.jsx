import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SlideFade,
  useDisclosure,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import mixpanel from "mixpanel-browser";
import React, { useEffect, useState } from "react";

import { useNFTGrid } from "./contexts/NFTGridContext";
import PersonalNFTGrid from "./PersonalNFTGrid";
import FeaturedNFTGrid from "./FeaturedNFTGrid";

import Collectible from "../Collectible";
import useDomainSupported from "../../hooks/useDomainSupported";
import { getDataURL } from "../../utils/fileHandler";

const NFTCategory = {
  Featured: "Featured",
  Personal: "Personal",
};

const NFTGrid = ({ nfts, paginate, displayLoading, isTryFeatured }) => {
  const [category, setCategory] = useState(NFTCategory.Featured);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [lastClicked, setLastClicked] = useState();
  const { domainSupported } = useDomainSupported();
  const { setSelectedBackground, setSelectedHologram } = useNFTGrid();

  const handleItemClick = (metadata) => {
    setLastClicked(metadata);
    onOpen();
  };

  const onSelectHologram = (metadata) => {
    // Clear character expression cache
    chrome.storage.sync.remove(["expressions", "selectedExpressions"]);

    const modelId = `${metadata.name}-${metadata.id}`;
    let message;
    if (metadata.type === "live2d") {
      message = {
        source: "extension",
        type: "live2d",
        id: modelId, // Model Id consists of 'nftName-tokenId'
        data: metadata.model_url,
        project: metadata.project,
      };
    } else if (metadata.type === "3d") {
      message = {
        source: "extension",
        type: "3d",
        id: modelId,
        data: metadata.model_url,
        project: metadata.project,
      };
    } else if (metadata.type === "2d") {
      message = {
        source: "extension",
        type: "2d",
        id: modelId,
        data: metadata.model_url,
        project: metadata.project,
      };
    }
    if (message) {
      // Notify content script of new model selection
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, message);
        });
      });
      // Update selection UI
      setSelectedHologram({
        id: modelId,
        dataURL: message.data,
        type: metadata.type,
      });

      // Track selection analytics
      mixpanel.time_event("Avatar Selection");
      mixpanel.track("Avatar Selection", {
        ID: modelId,
        Type: metadata.type,
        Project: metadata.project,
      });
    }
  };

  const onSelectBackground = async (metadata) => {
    if (metadata) {
      let dataURL; // base64-encoded data URL
      let imageURL = metadata.image;

      // Set dataURL imageURL is already base64-encoded data URL
      if (imageURL.substring(0, 5) === "data:") {
        dataURL = imageURL;
      } else {
        // Handle ipfs hash to imageURL conversion
        if (imageURL?.includes("ipfs://")) {
          imageURL = imageURL.replace("ipfs://ipfs/", "https://ipfs.io/ipfs/");
          imageURL = imageURL.replace("ipfs://", "https://ipfs.io/ipfs/");
        }
        // Convert image URL into data URL
        try {
          const response = await fetch(imageURL);
          const imageData = await response.arrayBuffer();
          dataURL = await getDataURL("octet-stream", imageData);
        } catch (e) {
          console.error(e);
          dataURL = chrome.runtime.getURL("./assets/img/background.png");
        }
      }

      // Notify content script of new background
      const backgroundID = `${metadata.name}-${metadata.id}`;
      setSelectedBackground({
        id: backgroundID,
        name: metadata.name,
      });
      const message = {
        source: "extension",
        type: "background_nft",
        dataURL: dataURL,
        imageURL: imageURL,
        nftID: backgroundID,
      };
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, message);
        });
      });
    }
  };

  useEffect(() => {
    if (nfts.length === 0) {
      setCategory(NFTCategory.Featured);
    } else {
      setCategory(NFTCategory.Personal);
    }
  }, [nfts]);

  return (
    <>
      {isOpen ? (
        <SlideFade in={isOpen}>
          <Collectible
            name={lastClicked.name}
            category={lastClicked.category}
            description={lastClicked.description}
            imageURL={lastClicked.image}
            onClick={() => {
              if (!domainSupported) {
                return chrome.tabs.create({
                  active: true,
                  url: "https://docs.hologram.xyz/guides/chrome-extension-guide",
                });
              } else if (lastClicked.category === "Hologram") {
                onSelectHologram(lastClicked);
              } else {
                onSelectBackground(lastClicked);
              }
              onClose();
            }}
            isOpen={isOpen}
            onBack={onClose}
          />
        </SlideFade>
      ) : !isTryFeatured ? (
        <>
          <Menu>
            <MenuButton
              mt={3}
              ml={2}
              as={Button}
              rightIcon={<ChevronDownIcon />}
              variant="link"
              color="white"
              position="fixed"
              outline="0"
              zIndex={0}
              _hover={{ backgroundColor: "rgba(0,0,0,0)", color: "white" }}
              _active={{ color: "white" }}
            >
              {category}
            </MenuButton>
            <MenuList minW="120px">
              <MenuItem
                color="black"
                onClick={() => setCategory(NFTCategory.Featured)}
              >
                Featured
              </MenuItem>
              <MenuItem
                color="black"
                onClick={() => setCategory(NFTCategory.Personal)}
              >
                Personal
              </MenuItem>
            </MenuList>
          </Menu>
          {category === NFTCategory.Featured ? (
            <FeaturedNFTGrid tabAlign="right" onItemClick={handleItemClick} />
          ) : (
            <PersonalNFTGrid
              nfts={nfts}
              paginate={paginate}
              displayLoading={displayLoading}
              onItemClick={handleItemClick}
            />
          )}
        </>
      ) : (
        <FeaturedNFTGrid onItemClick={handleItemClick} />
      )}
    </>
  );
};

export default NFTGrid;
