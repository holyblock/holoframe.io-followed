import { md5 } from "./md5";
import config from "../config";
import { mascots } from "../config/mascots";
import { NFTMetadata } from "../types";
import { NFTCollection } from "../types";

// Helper fn to parse model file from external metadata standards
export const getModelFromMetadata = (
  standard: string,
  network: string,
  nft: any
) => {
  if (standard === "ETM") {
    const assets = nft.metadata?.assets ?? [];

    for (let asset of assets) {
      // Avatar asset found
      if (asset.media_type === "model") {
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
export const getFeaturedCollections = async (): Promise<NFTCollection[]> => {
  const res = await fetch(config.assets.featured);
  const json = await res.json();
  return Object.keys(json).map((symbol: string) => {
    const mascot = json[symbol];
    const { name, network } = mascot;
    const collectionImage = `${
      config.assets.mascots
    }/${network}/${symbol}/${symbol.toLowerCase()}.png`; // <symbol>.png
    const assets = mascot?.assets.map((asset: any) => {
      const { id, type, format, previewFormat = "png" } = asset;
      const filename = `${symbol.toLowerCase()}_${id}`; // <token_symbol>_<mascot_id>
      const description = `${name} mascot, the latest featured character from the ${name} community.`;
      const modelURL = `${config.assets.mascots}/${network}/${symbol}/${filename}.${format}`;
      const imageURL = `${config.assets.mascots}/${network}/${symbol}/${filename}.${previewFormat}`;
      return getNFTMetadata(
        id,
        name,
        description,
        type,
        modelURL,
        imageURL,
        true
      );
    });
    return {
      name,
      symbol,
      network,
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
