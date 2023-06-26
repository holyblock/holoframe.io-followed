import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Grid,
  Flex,
  IconButton,
  SlideFade,
  Spinner,
  useDisclosure,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  Tooltip,
} from '@chakra-ui/react';
import { ChevronRightIcon, RepeatIcon } from '@chakra-ui/icons';
import { useAuth } from 'renderer/contexts/AuthContext';
import Card from 'renderer/components/Card';
import { NFTMetadata, SceneType } from 'renderer/types';
import localforage from 'localforage';
import { useNFT } from 'renderer/contexts/NFTContext';
import { ipfsHashToImageUrl } from 'renderer/utils/fileHandler';
import mixpanel from 'mixpanel-browser';
import CollectibleMenu from 'renderer/components/Menu/CollectibleMenu';
import useWindowSize from 'renderer/hooks/useWindowSize';
import { colors } from 'renderer/styles/theme';
import config from '../../../../../utils/config';
import Collectible from '../../components/Collectible';

const Collectibles = () => {
  const {
    featuredCollections,
    communityCollections,
    featuredItems,
    collectibles,
    selectedHologram,
    setSelectedHologram,
    selectedItems,
    setBackgroundImage,
    hasBackground,
    clearBackground,
    addItem,
    removeItem,
    paginate,
    loadingNFTs,
    initialized,
  } = useNFT();
  const { previewScreenSize, setPreviewScreenSize } = useWindowSize();

  const { isAuthenticated } = useAuth();
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [lastClicked, setLastClicked] = useState<any>(); // the latest clicked NFT's metadata
  const categories = ['Featured', 'Community', 'Personal'];
  const [categoryIndex, setCategoryIndex] = useState(isAuthenticated ? 2 : 0); // [Featured, Community, Personal]
  const [view, setView] = useState('Hologram'); // All, Hologram, NFT
  const [holograms, setHolograms] = useState([]);
  const [items, setItems] = useState([]);
  const selectedItemIDs = new Set(
    selectedItems?.map((i) => `${i.name}-${i.id}`)
  );
  // const hiddenFileInput = useRef<any>(null);
  const loader = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Categorize NFTs into holograms, backgrounds, etc
  useEffect(() => {
    setHolograms([]);
    setItems([]);

    const currHolograms = [];
    const currItems = [];
    for (const asset of collectibles) {
      if (
        asset?.model_url &&
        config.nfts.supportedTypes.includes(asset?.type)
      ) {
        currHolograms.push(asset);
      } else {
        currItems.push(asset);
      }
    }
    setHolograms(currHolograms);
    setItems(currItems);

    (async () => {
      if (!selectedHologram) {
        const cachedModel = await localforage.getItem('cachedModel');
        if (cachedModel) {
          setSelectedHologram(cachedModel as NFTMetadata);
        } else if (holograms.length > 0) {
          const initialModelMetadata = holograms[0];
          setSelectedHologram(initialModelMetadata); // Display selection on UI
        }
      }
    })();
  }, [collectibles]);

  // Init intersection observer for infinite scrolling
  useEffect(() => {
    const option = {
      root: null,
      rootMargin: '20px',
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

  const renderAll = collectibles.map((metadata) => {
    try {
      if (metadata && metadata.image) {
        const uniqueID = `${metadata?.name}-${metadata.id}`;
        const isHologram =
          config.nfts.supportedTypes.includes(metadata.type) &&
          metadata.model_url !== undefined;
        const isSelected =
          metadata.isHologram === 'Hologram'
            ? uniqueID === selectedHologram?.id
            : selectedItemIDs.has(uniqueID);
        let imageSrc: string = metadata.image;
        if (imageSrc.includes('ipfs://')) {
          imageSrc = ipfsHashToImageUrl(imageSrc);
          metadata.image = imageSrc;
        }
        return (
          <Card
            key={uniqueID}
            isSelected={isSelected}
            imageURL={imageSrc}
            nftName={metadata.name}
            nftId={metadata.id}
            isEnabled={false}
            onSelect={() => {
              metadata.isHologram = isHologram;
              setLastClicked(metadata);
              onOpen();
            }}
          />
        );
      }
      return;
    } catch (e) {
      console.error(metadata, e);
    }
  });

  // const renderFeaturedCollections = featuredCollections?.map((collection) => {
  //   return (
  //     <Card
  //       name={collection.name}
  //       key={collection.name}
  //       isSelected={null}
  //       imageURL={collection.image}
  //       onSelect={() => {
  //         setSelectedCollection(collection);
  //       }}
  //     />
  //   );
  // });

  const renderSelectedCollection = selectedCollection?.assetURIs?.map(
    (metadata) => {
      const uniqueID = `${metadata?.name}-${metadata.id}`;
      const selectedHologramUniqueID = `${selectedHologram?.name}-${selectedHologram?.id}`;
      const imageSrc: string = metadata.image;

      return (
        <Card
          name={metadata.name}
          key={metadata.id}
          isSelected={selectedHologramUniqueID === uniqueID}
          imageURL={imageSrc}
          onSelect={() => {
            setLastClicked(metadata);
            onOpen();
          }}
        />
      );
    }
  );

  const renderCollections = () => {
    let collectionsToRender = featuredCollections;
    if (categories[categoryIndex] === 'Community') {
      collectionsToRender = communityCollections;
    }
    return collectionsToRender?.map((collection) => {
      return (
        <Card
          name={collection.name}
          key={collection.name}
          isSelected={null}
          imageURL={collection.image}
          onSelect={() => {
            setSelectedCollection(collection);
          }}
        />
      );
    });
  };

  const renderHolograms = holograms.map((metadata, i: number) => {
    const uniqueID = `${metadata?.name}-${metadata.id}`;
    const selectedHologramUniqueID = `${selectedHologram?.name}-${selectedHologram?.id}`;
    let imageSrc: string = metadata.image;
    if (imageSrc.includes('ipfs://')) {
      imageSrc = ipfsHashToImageUrl(imageSrc);
      metadata.image = imageSrc;
    }

    try {
      return (
        <Card
          name={metadata.name}
          key={uniqueID}
          isSelected={selectedHologramUniqueID === uniqueID}
          imageURL={imageSrc}
          onSelect={() => {
            metadata.isHologram = true;
            setLastClicked(metadata);
            onOpen();
          }}
        />
      );
    } catch (e) {
      console.error(metadata, e);
    }
  });

  const renderItems = () => {
    let itemsToRender = items;
    if (categories[categoryIndex] === 'Featured') {
      itemsToRender = featuredItems;
    }
    return itemsToRender.map((metadata) => {
      try {
        if (metadata && metadata.image) {
          const uniqueID = `${metadata.name}-${metadata.id}`;
          let imageSrc: string = metadata.image;
          if (imageSrc.includes('ipfs://')) {
            imageSrc = ipfsHashToImageUrl(imageSrc);
            metadata.image = imageSrc;
          }
          return (
            <Card
              key={uniqueID}
              isSelected={selectedItemIDs.has(uniqueID)}
              imageURL={imageSrc}
              nftName={metadata.name}
              nftId={metadata.id}
              isEnabled={false}
              onSelect={() => {
                metadata.isHologram = false;
                setLastClicked(metadata);
                onOpen();
              }}
            />
          );
        }
      } catch (e) {
        console.error(metadata, e);
      }
    });
  };

  const onSelectView = async (newView: string) => {
    setView(newView);
    localforage.setItem('collectibleView', newView);
  };

  const onSetBackground = () => {
    if (!hasBackground) {
      mixpanel.track('Use NFT', {
        type: 'background',
      });
      setBackgroundImage(lastClicked.image);
    } else {
      clearBackground();
    }
    onClose();
  };

  const onAddToScene = async () => {
    if (lastClicked.isHologram) {
      mixpanel.track('Use NFT', {
        type: 'hologram',
        project: lastClicked.project,
      });
      setSelectedHologram(lastClicked);
    } else if (selectedItems?.includes(lastClicked)) {
      removeItem(lastClicked);
    } else {
      mixpanel.track('Use NFT', {
        type: 'sticker',
      });
      await addItem(lastClicked, SceneType.image);
    }
    onClose();
  };

  // const onUpload = () => {
  //   hiddenFileInput.current.click();
  // };

  // const renderUploadCard = () => {
  //   return (
  //     <>
  //       <Tooltip
  //         label="Accepts .zip (live2D), .glb, and .vrm files"
  //         key="upload"
  //       >
  //         <Box
  //           rounded="md"
  //           color="white"
  //           w={150}
  //           h={150}
  //           textAlign="center"
  //           _hover={{
  //             opacity: 1,
  //             cursor: 'pointer',
  //           }}
  //           onClick={onUpload}
  //         >
  //           <Center h="100%">
  //             <VStack>
  //               <ArrowUpIcon color="white" boxSize={8} />
  //               <Text color="white">Upload Model</Text>
  //             </VStack>
  //           </Center>
  //         </Box>
  //       </Tooltip>
  //       {/* <input
  //         ref={hiddenFileInput}
  //         onInput={onInput}
  //         type="file"
  //         accept=".zip,.7zip,.glb,.vrm"
  //         style={{ display: 'none' }}
  //       /> */}
  //     </>
  //   );
  // };

  return (
    <Flex pos="relative" h="100%" w="100%" alignItems="center" flexDir="column">
      {isOpen && lastClicked && (
        <SlideFade in={isOpen}>
          <Collectible
            name={lastClicked.name}
            isHologram={lastClicked.isHologram}
            description={lastClicked.description}
            imageURL={lastClicked.image}
            actionText={[
              'Set background',
              !selectedItems?.includes(lastClicked)
                ? lastClicked.isHologram
                  ? 'Use hologram'
                  : 'Add sticker'
                : 'Remove',
            ]}
            actions={[onSetBackground, onAddToScene]}
            isOpen={isOpen}
            onBack={onClose}
          />
        </SlideFade>
      )}
      <Flex w="100%" justifyContent="center" alignItems="top" pb="70px">
        <Tabs
          w="100%"
          defaultIndex={categoryIndex}
          variant="soft-rounded"
          fontFamily="Clash Grotesk"
          textTransform="uppercase"
          letterSpacing="3px"
          fontWeight="600px"
          fontSize="16px"
        >
          {selectedCollection ? (
            <Breadcrumb
              px={4}
              py={2}
              separator={<ChevronRightIcon color="gray.500" />}
            >
              <BreadcrumbItem>
                <BreadcrumbLink
                  _hover={{ textDecor: 'none' }}
                  onClick={() => setSelectedCollection(null)}
                >
                  {categories[categoryIndex]}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink
                  _hover={{ textDecor: 'none' }}
                  color={colors.brand.primary}
                >
                  {selectedCollection.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
          ) : (
            <TabList>
              <Tab
                color="white"
                borderRadius="5px"
                _selected={{
                  color: colors.brand.primary,
                  boxShadow: 'none',
                }}
                onClick={() => {
                  setCategoryIndex(0);
                  setView('Hologram');
                }}
              >
                Featured
              </Tab>
              {isAuthenticated && (
                <>
                  <Tab
                    color="white"
                    borderRadius="5px"
                    _selected={{
                      color: colors.brand.primary,
                      boxShadow: 'none',
                    }}
                    onClick={() => setCategoryIndex(1)}
                  >
                    Community
                  </Tab>
                  <Tab
                    color="white"
                    borderRadius="5px"
                    _selected={{
                      color: colors.brand.primary,
                      boxShadow: 'none',
                    }}
                    onClick={() => setCategoryIndex(2)}
                  >
                    Personal
                  </Tab>
                </>
              )}
            </TabList>
          )}
          {!selectedCollection && categories[categoryIndex] !== 'Community' && (
            <CollectibleMenu
              category={categories[categoryIndex]}
              view={view}
              onSelectView={onSelectView}
              previewScreenSize={previewScreenSize}
              toggleScreenSize={() => {
                if (previewScreenSize === config.video.widths.lg) {
                  setPreviewScreenSize(config.video.widths.md);
                } else {
                  setPreviewScreenSize(config.video.widths.lg);
                }
              }}
            />
          )}
          <TabPanels>
            <TabPanel>
              <Grid
                display="grid"
                gridTemplateColumns="repeat(auto-fill, minmax(130px, 1fr))"
                w="100%"
                gap={8}
                justifyItems="center"
                alignItems="center"
              >
                {!selectedCollection &&
                  view === 'Hologram' &&
                  renderCollections()}
                {!selectedCollection && view === 'NFT' && renderItems()}
                {selectedCollection && renderSelectedCollection}
              </Grid>
            </TabPanel>
            <TabPanel>
              <Grid
                display="grid"
                gridTemplateColumns="repeat(auto-fill, minmax(130px, 1fr))"
                w="100%"
                gap={8}
                justifyItems="center"
                alignItems="center"
              >
                {!selectedCollection && renderCollections()}
                {selectedCollection && renderSelectedCollection}
              </Grid>
            </TabPanel>
            <TabPanel>
              {/* Grid to display collectibles */}
              {loadingNFTs || !initialized ? (
                <Box
                  h="100%"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Spinner />
                </Box>
              ) : (
                <Grid
                  display="grid"
                  // py={5}
                  gridTemplateColumns="repeat(auto-fill, minmax(130px, 1fr))"
                  w="100%"
                  gap={8}
                  justifyItems="center"
                  alignItems="center"
                >
                  {view === 'All' && renderAll}
                  {view === 'Hologram' && renderHolograms}
                  {view === 'NFT' && renderItems()}
                </Grid>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Flex>
    </Flex>
  );
};

export default Collectibles;
