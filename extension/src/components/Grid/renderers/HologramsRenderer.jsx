import React from "react";

import Card from "../../Collectible/Card";
import { ipfsHashToImageUrl } from "../../../utils/fileHandler";

const HologramsRenderer = ({ holograms, selectedHologram, onSelect }) => {
  return holograms.map((metadata) => {
    try {
      if (metadata) {
        const uniqueID = `${metadata.name}-${metadata.id}`;
        let imageSrc = metadata.image;
        if (imageSrc.includes("ipfs://")) {
          imageSrc = ipfsHashToImageUrl(imageSrc);
          metadata.image = imageSrc;
        }
        return (
          <Card
            key={uniqueID}
            isSelected={
              selectedHologram ? uniqueID === selectedHologram.id : false
            }
            imageURL={imageSrc}
            nftName={metadata.name}
            nftId={metadata.id}
            isEnabled={false}
            onSelect={() => {
              metadata.category = "Hologram";
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

export default HologramsRenderer;
