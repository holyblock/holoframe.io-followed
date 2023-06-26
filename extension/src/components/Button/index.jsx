import React from 'react';
import { Box, Button, Typography } from '@chakra-ui/react'
import { colors } from '../../utils/theme';
// import { Button, Box, Typography } from '@material-ui/core'
// import { makeStyles } from '@material-ui/core/styles'

// interface CustomButtonProps {
//   text: string,
//   variant?: any, // outlined, text, or contained
//   color?: any, // primary or secondary
//   onClick?: () => void
// }
const DEFAULT_COLOR = colors.brand.primary;
const DEFAULT_TEXT = 'white';

const CustomButton = (props) => {
  const { icon, text, size, height, variant, textColor, secondaryTextColor, color, secondaryColor, onClick, selected, disabled } = props;
  const primaryColor = color ? color : DEFAULT_COLOR;
  const primaryText = textColor ? textColor : DEFAULT_TEXT;
  return (
    <Button
      backgroundColor={selected ? secondaryColor : primaryColor}
      colorScheme={primaryColor}
      color={selected ? secondaryTextColor : primaryText}
      borderColor={selected && secondaryColor}
      isActive={selected}
      _active={{
        style: {
          bg: secondaryColor,
          color: secondaryTextColor ?? 'white'
        }
      }}
      size={size}
      width='100%'
      height={height}
      variant={variant ? variant : 'solid'}
      onClick={onClick}
      leftIcon={icon}
      disabled={disabled}
    >
      {/* <Typography component='span' variant='body2'> */}
      {/* <Box fontWeight={800}> */}
      {text}
      {/* </Box> */}
      {/* </Typography> */}
    </Button>
  );
};

export default CustomButton;