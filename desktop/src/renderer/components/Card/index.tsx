import { useEffect, useState } from 'react';
import { AspectRatio, Box, Image, Tooltip } from '@chakra-ui/react';
import { colors } from '../../styles/theme';

interface CollectibleCardProps {
  key: string;
  name?: string;
  isSelected: boolean;
  imageURL: string;
  onSelect: (e: any) => void;
}

const CollectibleCard = (props: CollectibleCardProps) => {
  const { key, name, isSelected, imageURL, onSelect } = props;
  const [selected, setSelected] = useState(isSelected ?? false);
  const [display, setDisplay] = useState(true);

  useEffect(() => {
    if (isSelected !== undefined) {
      setSelected(isSelected);
    }
  }, [isSelected]);

  return (
    <Box
      key={key}
      outline={selected ? `4px solid ${colors.brand.primary}` : 'initial'}
      backgroundColor="white"
      rounded="md"
      w={150}
      h={150}
      textAlign="center"
      _hover={{
        opacity: 1,
        cursor: 'pointer',
      }}
      onClick={onSelect}
      display={display ? 'initial' : 'none'}
      overflow="hidden"
    >
      <Tooltip label={name}>
        {imageURL.endsWith('.mp4') ? (
          <AspectRatio maxW={150} ratio={1}>
            <video src={imageURL} muted autoPlay loop preload="metadata" />
          </AspectRatio>
        ) : (
          <Image
            borderRadius={5}
            objectFit="cover"
            src={imageURL}
            w="100%"
            height={150}
            alt="nft"
            onError={(i: any) => {
              // If image doesn"t load correctly, hide from user
              i.target.style.display = 'none';
              setDisplay(false);
            }}
          />
        )}
      </Tooltip>
    </Box>
  );
};

export default CollectibleCard;
