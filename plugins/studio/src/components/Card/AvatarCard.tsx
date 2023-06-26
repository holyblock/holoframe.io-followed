import React, { useEffect, useState } from 'react';
import { Box, Image } from '@chakra-ui/react';
import { colors } from '../../styles/theme';

interface AvatarCardProps {
  isSelected: boolean,
  imageUrl: string,
  onSelect?: () => void
}

const AvatarCard = (props: AvatarCardProps) => {
  const { isSelected, imageUrl, onSelect } = props;
  const [selected, setSelected] = useState(isSelected ?? false);

  useEffect(() => {
    if (isSelected !== undefined) {
      setSelected(isSelected);
    }
  }, [isSelected])

  return (
    <Box
      outline={isSelected ? `4px solid ${colors.brand.primary}` : 'none'}
      backgroundColor={'white'}
      rounded={'md'}
      w={150}
      h={150}
      textAlign='center'
      _hover={{
        opacity: 1,
        cursor: 'pointer',
        outline: `4px solid ${colors.brand.primary}`
      }}
      onClick={onSelect}
    >
      <Image
        borderRadius={5}
        objectFit='cover'
        src={imageUrl}
        w='100%'
        height={150}
        alt='nft'
      />
    </Box>
  );
};

export default AvatarCard;