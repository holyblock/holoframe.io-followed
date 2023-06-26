import React from 'react';
import { Button } from '@chakra-ui/react'

const DEFAULT_COLOR = "transparent";

const CustomButton = (props) => {
  const { 
    disabled,
    icon, 
    text, 
    borderRadius,
    size, 
    height, 
    width, 
    maxWidth,
    variant, 
    color, 
    secondaryColor, 
    textColor,
    onClick, 
    selected 
  } = props;
  const primaryColor = color ? color : DEFAULT_COLOR;

  return (
    <Button
      disabled={disabled}
      backgroundColor={primaryColor}
      colorScheme={primaryColor}
      color={textColor}
      bg={selected && secondaryColor}
      borderColor={selected && secondaryColor}
      borderRadius={borderRadius}
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