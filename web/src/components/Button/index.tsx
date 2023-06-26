import React from 'react';
import { Button } from '@chakra-ui/react'

const DEFAULT_COLOR = "purple";

const CustomButton = (props) => {
  const { 
    icon, 
    text, 
    size, 
    height, 
    width, 
    maxWidth,
    variant, 
    color, 
    secondaryColor, 
    onClick, 
    selected 
  } = props;
  const primaryColor = color ? color : DEFAULT_COLOR;

  return (
    <Button
      colorScheme={primaryColor}
      bg={selected && secondaryColor}
      borderColor={selected && secondaryColor}
      size={size}
      width={width ?? "100%"}
      maxWidth={maxWidth}
      height={height}
      variant={variant ? variant : 'solid'}
      onClick={onClick}
      leftIcon={icon}
    >
      {text}
    </Button>
  );
};

export default CustomButton;