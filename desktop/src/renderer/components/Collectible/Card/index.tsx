import React, { useEffect, useState } from 'react';
import { Box, Image, Tooltip } from '@chakra-ui/react';
import { colors } from 'renderer/styles/theme';

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
      backgroundColor="white"
      rounded="md"
      w={150}
      h={150}
      textAlign="center"
      _hover={{
        cursor: 'pointer',
      }}
      onClick={onSelect}
      display={display ? 'initial' : 'none'}
    >
      <Tooltip label={name} placement="top">
        <Image
          borderRadius={5}
          objectFit="cover"
          src={imageURL}
          loading="lazy"
          w="100%"
          height={150}
          alt="nft"
          onError={(i) => {
            // If image doesn"t load correctly, hide from user
            i.target.style.display = 'none';
            setDisplay(false);
          }}
        />
      </Tooltip>
    </Box>
  );
};

export default CollectibleCard;
