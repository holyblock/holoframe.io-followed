import React from 'react';
import { Button } from '@chakra-ui/react';

const IconButton = (props: any) => {
  const { icon, size, variant, color, onClick } = props;

  return (
    <Button
      colorScheme={color || 'transparent'}
      padding="0"
      margin="0"
      variant={variant || 'solid'}
      onClick={onClick}
      _hover={{
        bgColor: 'transparent',
      }}
    >
      <img src={icon} alt="" />
    </Button>
  );
};

export default IconButton;
