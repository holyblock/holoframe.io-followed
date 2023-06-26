import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import SectionLabel from '../Label/SectionLabel';

interface SubheaderProps {
  label?: string,
  labelColor?: string,
  title: string,
  alignment?: string // left, center, right
}

const Subheader = (props: SubheaderProps) => {
  const { label, labelColor, title, alignment } = props;
  return (
    <Flex
      maxW={['container.xs', 'container.xl']}
      flexDir='column'
      alignItems={['center', 'start']}
      pt={['30px', '150px']}
    >
      {/* <Box 
        bgColor='rgba(255,255,255,0.2)' 
        borderRadius={['58px', '80px']}
        px={['15px', '20px']}
        py={['3px', '13px']}
        letterSpacing={['0.1em', '0.2em']}
      >
        <Text
          fontSize={['8px', '12px']}
          fontFamily='Clash Grotesk'
          textTransform='uppercase'
        >
          Features
        </Text>
      </Box> */}
      { label && labelColor &&
        <SectionLabel
          text={label}
          bgColor={labelColor}
        />
      }
      
      <Heading 
        textAlign={alignment === 'left' ? ['center', 'left'] : ['center', 'center']}
        color='white'
        pt={['8px', '20px']}
        fontWeight='700'
        fontSize={['30px', '65px']}
        lineHeight={['29.7px', '64.35px']}
      >
        { title }
      </Heading>
    </Flex>
);
};

export default Subheader;