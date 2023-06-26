import React, { useEffect, useState } from "react";
import { Box, Image, Tooltip, AspectRatio } from "@chakra-ui/react";
import { colors } from "../../../utils/theme";

const CollectibleCard = ({ name, type, isSelected, imageURL, onSelect }) => {
  const [selected, setSelected] = useState(isSelected ?? false);
  const [display, setDisplay] = useState(true);

  useEffect(() => {
    if (isSelected !== undefined) {
      setSelected(isSelected);
    }
  }, [isSelected]);

  return (
    <Box
      outline={selected && `4px solid ${colors.brand.primary}`}
      backgroundColor={"white"}
      rounded={"md"}
      // opacity={selected ? 1 : 0.7}
      w={150}
      h={150}
      textAlign="center"
      _hover={{
        cursor: "pointer",
      }}
      onClick={onSelect}
      display={display ? "initial" : "none"}
      overflow="hidden"
    >
      <Tooltip label={name} placement="top">
        {imageURL.endsWith(".mp4") ? (
          <AspectRatio maxW={150} ratio={1}>
            <video src={imageURL} muted autoPlay loop preload="metadata" />
          </AspectRatio>
        ) : (
          <Image
            borderRadius={5}
            objectFit="cover"
            src={imageURL}
            loading="lazy"
            w="100%"
            height={150}
            alt="nft"
            onError={(i) => {
              // If image doesn't load correctly, hide from user
              i.target.style.display = "none";
              setDisplay(false);
            }}
          />
        )}
      </Tooltip>
    </Box>
  );
};

export default CollectibleCard;
