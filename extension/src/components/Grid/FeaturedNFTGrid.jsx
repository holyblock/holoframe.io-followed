import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Fade,
  Flex,
  SimpleGrid,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

import Card from "../Collectible/Card";
import featuredBackgrounds from "../../../../utils/assets/featuredBackgrounds.json";
import { getChromeCache } from "../../utils/chromeAPIHelper";
import { getFeaturedCollections } from "../../../../utils/helpers/assetHelper";
import { useNFTGrid } from "./contexts/NFTGridContext";
import { theme } from "../../utils/theme";

const FeaturedHolograms = ({
  selectedCollection: defaultCollection,
  selectedHologram: defaultHologram,
  onSelect,
  onSelectCollection,
}) => {
  const [featuredCollections, setFeaturedCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedHologram, setSelectedHologram] = useState(null);

  // Get featured collections
  useEffect(() => {
    (async () => {
      const featuredCollections = await getFeaturedCollections();
      setFeaturedCollections(featuredCollections);
    })();
  }, []);

  useEffect(() => {
    setSelectedCollection(defaultCollection);
  }, [defaultCollection]);

  useEffect(() => {
    setSelectedHologram(defaultHologram);
  }, [defaultHologram]);

  return (
    <SimpleGrid
      columns={2}
      spacing={4}
      pb={4}
      px={1}
      background={theme.colors.brand.secondary}
      position="relative"
      zIndex={0}
    >
      {selectedCollection
        ? selectedCollection.assetURIs.map((asset, i) => (
            <Card
              key={`${asset.name}-${asset.id}`}
              isSelected={
                selectedHologram
                  ? selectedHologram.id === `${asset.name}-${asset.id}`
                  : false
              }
              imageURL={asset.image}
              onSelect={() => onSelect({ ...asset, category: "Hologram" })}
            />
          ))
        : featuredCollections?.map((collection, i) => (
            <Card
              key={`${collection.name}-${i}`}
              imageURL={collection.image}
              onSelect={() => {
                setSelectedCollection(collection);
                onSelectCollection(collection);
              }}
            />
          ))}
    </SimpleGrid>
  );
};

const FeaturedBackgrounds = ({
  onSelect,
  selectedBackground: defaultBackground,
}) => {
  const [selectedBackground, setSelectedBackground] = useState();

  useEffect(() => {
    setSelectedBackground(defaultBackground);
  }, [defaultBackground]);

  return (
    <SimpleGrid
      columns={2}
      spacing={4}
      pb={4}
      px={1}
      background="#1E1F24"
      position="relative"
      zIndex={0}
    >
      {featuredBackgrounds.map((item, i) => (
        <Card
          key={i}
          imageURL={item.image}
          isSelected={
            selectedBackground
              ? selectedBackground.id === `${item.name}-${item.id}`
              : false
          }
          onSelect={() => onSelect({ ...item, category: "NFT" })}
        />
      ))}
    </SimpleGrid>
  );
};

const FeaturedNFTGrid = ({ tabAlign = "left", onItemClick }) => {
  const {
    selectedBackground,
    setSelectedBackground,
    selectedHologram,
    setSelectedHologram,
  } = useNFTGrid();
  const [view, setView] = useState("Holograms"); // Holograms, Backgrounds
  const [showBack, setShowBack] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const featuredCollections = getFeaturedCollections();

  const onSelectView = async (view) => {
    setView(view);
  };

  const handleSelectCollection = (collection) => {
    setSelectedCollection(collection);
    setShowBack(true);
  };

  const handleCollectionBack = () => {
    setShowBack(false);
    setSelectedCollection(null);
  };

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
        } else if (featuredCollections.length > 0) {
          const initialModelMetadata = featuredCollections[0].assetURIs[0];
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
  }, []);

  return (
    <Flex h="100%" w="100%" flexDir="column" alignItems="center">
      {showBack ? (
        <Breadcrumb
          fontSize="sm"
          mt={2}
          mr={3}
          mb="10px"
          separator=">"
          spacing={1}
          display="flex"
          w="100%"
          justifyContent={tabAlign === "right" ? "flex-end" : "center"}
        >
          <BreadcrumbItem textUnderlineOffset="6px">
            <BreadcrumbLink onClick={handleCollectionBack}>
              Holograms
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem textDecoration="underline" textUnderlineOffset="6px">
            <BreadcrumbLink>{selectedCollection?.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      ) : (
        <Breadcrumb
          fontSize="sm"
          mt={2}
          mr={3}
          mb="10px"
          separator=""
          spacing={1}
          display="flex"
          w="100%"
          justifyContent={tabAlign === "right" ? "flex-end" : "center"}
        >
          <BreadcrumbItem
            textDecoration={view === "Holograms" && "underline"}
            textUnderlineOffset="6px"
          >
            <BreadcrumbLink onClick={() => onSelectView("Holograms")}>
              Holograms
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem
            textDecoration={view === "Backgrounds" && "underline"}
            textUnderlineOffset="6px"
          >
            <BreadcrumbLink onClick={() => onSelectView("Backgrounds")}>
              Backgrounds
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      )}
      <Fade in>
        {view === "Holograms" && (
          <FeaturedHolograms
            selectedCollection={selectedCollection}
            selectedHologram={selectedHologram}
            onSelect={onItemClick}
            onSelectCollection={handleSelectCollection}
          />
        )}
        {view === "Backgrounds" && (
          <FeaturedBackgrounds
            selectedBackground={selectedBackground}
            onSelect={onItemClick}
          />
        )}
      </Fade>
    </Flex>
  );
};

export default FeaturedNFTGrid;
