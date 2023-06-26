import { md5 } from '../../../utils/helpers/md5';
import config from '../../../utils/config';
import { mascots, featured } from '../../../utils/config/mascots';
import { NFTMetadata } from '../types';
import { NFTCollection } from '../../../utils/types';

// Helper fn to parse model file from external metadata standards
export const getModelFromMetadata = (
  standard: string,
  network: string,
  nft: any
) => {
  if (standard === 'ETM') {
    const metadata = JSON.parse(nft.metadata);
    const assets = metadata?.assets ?? [];

    for (let asset of assets) {
      // Avatar asset found
      if (asset.asset_type === 'avatar') {
        const files = asset.files;

        for (const file of files) {
          // Avatar GLB model found
          if (file.file_type === 'model/glb') {
            return file.url;
          }
        }
      }
    }
    return '';
  } else {
    const partnerConfig = config.partners[network][nft.symbol];
    const tokenHash = md5(
      `${nft.symbol}-${partnerConfig.version}-${nft.token_id}`
    );
    const modelURL = `${config.assets.partnershipAssets}/${nft.symbol}/${partnerConfig.type}/${partnerConfig.version}/${tokenHash}.${partnerConfig.format}`;
    return modelURL;
  }
};

// Get all community collections accessible to token-gated user
export const getCommunityCollection = (
  network: string,
  nft: any
): NFTCollection | undefined => {
  const mascotList = mascots[network][nft.symbol];
  const collectionImage = `${config.assets.mascots}/${network}/${
    nft.symbol
  }/${nft.symbol.toLowerCase()}.png`; // <symbol>.png
  if (mascotList) {
    const assets: NFTMetadata[] = mascotList?.map((mascot): NFTMetadata => {
      const filename = `${nft.symbol.toLowerCase()}_${mascot.id}`; // <token_symbol>_<mascot_id>
      const description = `${nft.name} mascot, accessible by any member in the ${nft.name} community.`;
      const modelURL = `${config.assets.mascots}/${network}/${nft.symbol}/${filename}.${mascot.format}`;
      const imageURL = `${config.assets.mascots}/${network}/${nft.symbol}/${filename}.png`;
      return getNFTMetadata(
        mascot.id,
        nft.name,
        description,
        mascot.type,
        modelURL,
        imageURL,
        true
      );
    });
    return {
      name: nft.name,
      symbol: nft.symbol,
      network: network,
      image: collectionImage,
      assetURIs: assets,
    };
  } else {
    return undefined;
  }
};

// Get all featured collections accessible to anyone
export const getFeaturedCollections = (): NFTCollection[] => {
  return Object.keys(featured).map((symbol: string) => {
    const mascot = featured[symbol];
    const collectionImage = `${config.assets.mascots}/${
      mascot.network
    }/${symbol}/${symbol.toLowerCase()}.png`; // <symbol>.png
    const assets = mascot?.assets.map((asset: any) => {
      const filename = `${symbol.toLowerCase()}_${asset.id}`; // <token_symbol>_<mascot_id>
      const description = `${mascot.name} mascot, the latest featured character from the ${mascot.name} community.`;
      const modelURL = `${config.assets.mascots}/${mascot.network}/${symbol}/${filename}.${asset.format}`;
      const imageURL = `${config.assets.mascots}/${mascot.network}/${symbol}/${filename}.png`;
      return getNFTMetadata(
        asset.id,
        mascot.name,
        description,
        asset.type,
        modelURL,
        imageURL,
        true
      );
    });
    return {
      name: mascot.name,
      symbol: symbol,
      network: mascot.network,
      image: collectionImage,
      assetURIs: assets,
    };
  });
};

// Takes in Moralis's NFT response and convert to NFTMetadata type
const getNFTMetadata = (
  id: string,
  name: string,
  description: string,
  type: string,
  modelURL: string,
  imageURL: string,
  isHologram: boolean
): NFTMetadata => {
  return {
    id: id,
    name: name,
    description: description,
    type: type,
    model_url: modelURL,
    image: imageURL,
    isHologram: isHologram,
  };
};
