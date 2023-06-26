import React from "react";

import Card from "../../Collectible/Card";
import config from "../../../config/constants";
import { ipfsHashToImageUrl } from "../../../utils/fileHandler";

const NftsRenderer = ({
  nfts,
  selectedBackground,
  selectedHologram,
  onSelect,
}) => {
  return nfts.map((metadata) => {
    try {
      if (metadata && metadata.image) {
        const uniqueID = `${metadata?.name}-${metadata.id}`;
        let imageSrc = metadata.image;
        if (imageSrc.includes("ipfs://")) {
          imageSrc = ipfsHashToImageUrl(imageSrc);
          metadata.image = imageSrc;
        }
        const category =
          config.nfts.supportedTypes.includes(metadata.type) &&
          metadata.model_url !== undefined
            ? "Hologram"
            : "NFT";
        const isSelected =
          category === "Hologram"
            ? uniqueID === selectedHologram?.id
            : uniqueID === selectedBackground?.id;
        return (
          <Card
            key={uniqueID}
            isSelected={isSelected}
            imageURL={imageSrc}
            nftName={metadata.name}
            nftId={metadata.id}
            isEnabled={false}
            onSelect={() => {
              metadata.category = category;
              onSelect(metadata);
            }}
          />
        );
      } else {
        return;
      }
    } catch (e) {
      console.error(metadata, e);
    }
  });
};

export default NftsRenderer;
