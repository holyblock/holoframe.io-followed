import React from 'react';
// import Image from 'next/image';
import { Box, Button } from '@chakra-ui/react';

const IconButton = (props: any) => {
  const { icon, size, variant, color, onClick } = props;

  return (
    <Button
      colorScheme={color ? color : "transparent"}
      padding="0"
      margin="0"
      variant={variant ? variant : 'solid'}
      onClick={onClick}
    >
      <img src={icon} alt="grid" />
    </Button>
  );
};

export default IconButton;