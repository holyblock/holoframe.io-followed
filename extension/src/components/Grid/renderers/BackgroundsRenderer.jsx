import React from "react";

import Card from "../../Collectible/Card";
import { ipfsHashToImageUrl } from "../../../utils/fileHandler";

const BackgroundsRenderer = ({ backgrounds, selectedBackground, onSelect }) => {
  return backgrounds.map((metadata) => {
    try {
      if (metadata && metadata.image) {
        const uniqueID = `${metadata.name}-${metadata.id}`;
        let imageSrc = metadata.image;
        if (imageSrc.includes("ipfs://")) {
          imageSrc = ipfsHashToImageUrl(imageSrc);
          metadata.image = imageSrc;
        }
        return (
          <Card
            key={uniqueID}
            isSelected={uniqueID === selectedBackground?.id}
            imageURL={imageSrc}
            nftName={metadata.name}
            nftId={metadata.id}
            isEnabled={false}
            onSelect={() => {
              metadata.category = "NFT";
              onSelect(metadata);
            }}
          />
        );
      }
    } catch (e) {
      console.error(metadata, e);
    }
  });
};

export default BackgroundsRenderer;
