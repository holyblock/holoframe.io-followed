import { md5 } from "../../../utils/helpers/md5";
import config from "../../../utils/config";
import { mascots, featured } from "../../../utils/config/mascots";
import { NFTMetadata, NFTCollection } from "../../../utils/types";

// Helper fn to parse model file from external metadata standards
export const getModelFromMetadata = (
  standard: string,
  network: string,
  nft: any
) => {
  if (standard === "ETM") {
    const metadata = JSON.parse(nft.metadata);
    const assets = metadata?.assets ?? [];

    for (let asset of assets) {
      // Avatar asset found
      if (asset.asset_type === "avatar") {
        const files = asset.files;

        for (const file of files) {
          // Avatar GLB model found
          if (file.file_type === "model/glb") {
            return file.url;
          }
        }
      }
    }
    return "";
  } else {
    const { symbol } = nft.contractMetadata;
    const { tokenId } = nft.id;
    const partnerConfig = config.partners[network][symbol];
    const tokenHash = md5(
      `${symbol}-${partnerConfig.version}-${Number(tokenId)}`
    );
    const modelURL = `${config.assets.partnershipAssets}/${symbol}/${partnerConfig.type}/${partnerConfig.version}/${tokenHash}.${partnerConfig.format}`;
    return modelURL;
  }
};

// Get all community collections accessible to token-gated user
export const getCommunityCollection = (
  network: string,
  nft: any
): NFTCollection | undefined => {
  const { title } = nft;
  const { symbol } = nft.contractMetadata;
  if (!symbol) return undefined;
  const mascotList = mascots[network][symbol];
  const collectionImage = `${
    config.assets.mascots
  }/${network}/${symbol}/${symbol.toLowerCase()}.png`; // <symbol>.png
  if (mascotList) {
    const assets: NFTMetadata[] = mascotList?.map((mascot): NFTMetadata => {
      const filename = `${symbol?.toLowerCase()}_${mascot.id}`; // <token_symbol>_<mascot_id>
      const description = `${title} mascot, accessible by any member in the ${title} community.`;
      const modelURL = `${config.assets.mascots}/${network}/${symbol}/${filename}.${mascot.format}`;
      const imageURL = `${config.assets.mascots}/${network}/${symbol}/${filename}.png`;
      return getNFTMetadata(
        mascot.id,
        title,
        description,
        mascot.type,
        modelURL,
        imageURL,
        true
      );
    });
    return {
      name: title,
      symbol: symbol,
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

// Helper fn to parse model file from external metadata standards
export const get3dModelUrl = (
  tokenId: string,
  symbol: string,
  version: string,
  format: string
) => {
  const tokenHash = md5(`${symbol}-${version}-${Number(tokenId)}`);
  const modelURL = `${config.assets.partnershipAssets}/${symbol}/3d/${version}/${tokenHash}.${format}`;
  return modelURL;
};

export const getVideoUrl = (tokenId: string, symbol: string) => {
  return `${config.assets.partnershipAssets}/${symbol}/3d/videos/${Number(
    tokenId
  )}.mp4`;
};
