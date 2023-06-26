import React from 'react';
import { Box, Text } from '@chakra-ui/react';

interface SectionLabelProps {
  text: string,
  bgColor: string,
  color?: string
}
const SectionLabel = (props: SectionLabelProps) => {
  const { text, bgColor, color } = props;
  return (
    <Box 
      bgColor={bgColor} 
      borderRadius={['58px', '80px']}
      px={['15px', '20px']}
      py={['3px', '13px']}
      letterSpacing={['0.1em', '0.2em']}
    >
      <Text
        fontSize={['8px', '12px']}
        fontFamily='Clash Grotesk'
        textTransform='uppercase'
        color={color ?? 'white'}
      >
        { text }
      </Text>
    </Box>
  );
};

export default SectionLabel;