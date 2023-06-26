import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  IconButton,
  Spinner,
  Tooltip,
} from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import { AiOutlinePicture } from 'react-icons/ai';
import { BsGrid, BsPerson } from 'react-icons/bs';
import { colors } from 'renderer/styles/theme';
import { useState } from 'react';
import localforage from 'localforage';
import { useNFT } from 'renderer/contexts/NFTContext';
import { getFeaturedCollections } from '../../../../../utils/helpers/assetHelper';

interface CollectibleMenuProps {
  category: string; // Featured, Community, Personal
  view: string; // All, Hologram, NFT
  onSelectView: (view: string) => void;
  previewScreenSize: number;
  toggleScreenSize: () => void;
}

const CollectibleMenu = (props: CollectibleMenuProps) => {
  const { category, view, onSelectView, previewScreenSize, toggleScreenSize } =
    props;

  const { setFeaturedCollections, refresh } = useNFT();

  const [featuredCollectionsRefreshed, setFeaturedCollectionsRefreshed] =
    useState(false);
  const [personalCollectionsRefreshed, setPersonalCollectionsRefreshed] =
    useState(false);
  const [loading, setLoading] = useState(false);

  const handleRefreshPersonalCollections = async () => {
    setLoading(true);
    await refresh();
    setPersonalCollectionsRefreshed(true);
    setLoading(false);
  };

  const handleRefreshFeaturedCollections = async () => {
    try {
      setLoading(true);
      const collections = await getFeaturedCollections();
      await localforage.setItem('featuredCollections', collections);
      setFeaturedCollections(collections);
      setFeaturedCollectionsRefreshed(true);
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Flex my={1} mx={4} justifyContent="space-between" alignItems="center">
      {/* TODO: Implement screen size changer */}
      {/* <IconButton
        aria-label="size"
        size="lg"
        variant="unstyled"
        icon={
          previewScreenSize === constants.video.widths.md ? (
            <BiFullscreen />
          ) : (
            <BiExitFullscreen />
          )
        }
        onClick={toggleScreenSize}
        _hover={{
          color: !refreshed ? colors.brand.primary : 'inherit',
        }}
      /> */}
      {/* Nav menu for types of collectibles */}
      {category === 'Personal' && (
        <Breadcrumb fontSize="md" separator="" spacing={3}>
          <BreadcrumbItem
            textDecoration={view === 'All' && 'underline'}
            textColor={view === 'All' && colors.brand.primary}
            textUnderlineOffset="6px"
            fontSize="12px"
          >
            <BsGrid style={{ marginRight: 4 }} fontSize="14px" />
            <BreadcrumbLink onClick={() => onSelectView('All')}>
              All
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem
            textDecoration={view === 'Hologram' && 'underline'}
            textColor={view === 'Hologram' && colors.brand.primary}
            textUnderlineOffset="6px"
            fontSize="12px"
          >
            <BsPerson style={{ marginRight: 4 }} fontSize="14px" />
            <BreadcrumbLink onClick={() => onSelectView('Hologram')}>
              Holograms
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem
            textDecoration={view === 'NFT' && 'underline'}
            textColor={view === 'NFT' && colors.brand.primary}
            textUnderlineOffset="6px"
            fontSize="12px"
          >
            <AiOutlinePicture style={{ marginRight: 4 }} fontSize="14px" />
            <BreadcrumbLink onClick={() => onSelectView('NFT')}>
              NFTs
            </BreadcrumbLink>
          </BreadcrumbItem>
          {loading ? (
            <Flex height="40px" alignItems="center" ml="auto" px="12px">
              <Spinner size="sm" ml="auto" />
            </Flex>
          ) : (
            <Tooltip label="Refresh">
              <IconButton
                disabled={personalCollectionsRefreshed}
                aria-label="refresh"
                variant="unstyled"
                icon={<RepeatIcon />}
                onClick={handleRefreshPersonalCollections}
                _hover={{
                  color: !personalCollectionsRefreshed
                    ? colors.brand.primary
                    : 'inherit',
                }}
              />
            </Tooltip>
          )}
        </Breadcrumb>
      )}
      {category === 'Featured' && (
        <Flex alignItems="center" width="100%">
          <Breadcrumb fontSize="md" separator="" spacing={3}>
            <BreadcrumbItem
              textDecoration={view === 'Hologram' && 'underline'}
              textColor={view === 'Hologram' && colors.brand.primary}
              textUnderlineOffset="6px"
              fontSize="12px"
            >
              <BsPerson style={{ marginRight: 4 }} fontSize="14px" />
              <BreadcrumbLink onClick={() => onSelectView('Hologram')}>
                Holograms
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem
              textDecoration={view === 'NFT' && 'underline'}
              textColor={view === 'NFT' && colors.brand.primary}
              textUnderlineOffset="6px"
              fontSize="12px"
            >
              <AiOutlinePicture style={{ marginRight: 4 }} fontSize="14px" />
              <BreadcrumbLink onClick={() => onSelectView('NFT')}>
                Backgrounds
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          {loading ? (
            <Flex height="40px" alignItems="center" ml="auto" px="12px">
              <Spinner size="sm" ml="auto" />
            </Flex>
          ) : (
            <Tooltip label="Refresh">
              <IconButton
                disabled={featuredCollectionsRefreshed}
                aria-label="refresh"
                variant="unstyled"
                icon={<RepeatIcon />}
                onClick={handleRefreshFeaturedCollections}
                _hover={{
                  color: !featuredCollectionsRefreshed
                    ? colors.brand.primary
                    : 'inherit',
                }}
              />
            </Tooltip>
          )}
        </Flex>
      )}
    </Flex>
  );
};

export default CollectibleMenu;
