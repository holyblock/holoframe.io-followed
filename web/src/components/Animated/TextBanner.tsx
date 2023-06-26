import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { keyframes, Box, Heading } from '@chakra-ui/react';

interface TextBannerProps {
  heading: string
}

const TextBanner = (props: TextBannerProps) => {
  const { heading } = props;
  const linearCarousel = keyframes`
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(calc(-50% - 80px));
    }
  `;
  const animation = `${linearCarousel} infinite 20s linear`
  
  const renderText = [...Array(15)].map(() => {
    return (
      <React.Fragment key={uuidv4()}>
        <Heading fontSize={['12px', null, '16px', '20px']} whiteSpace='nowrap' w='100%' size='md' color='white' mx={2}>
          { heading }
        </Heading>
        <Heading fontSize={['12px', null, '16px', '20px']} size='md' color='white' mx={2}>
          ·
        </Heading>
      </React.Fragment>
    )
  })

  return (
    <Box
      mt={['9px', '27px', '40px', '60px']}
      w={['calc(100vw - 30px)', 'calc(100vw - 60px)']}
      h={['37px', '50px', '60px', '83px']}
      borderRadius={['6px', '12px']} 
      border='1px solid rgba(255,255,255,0.26)'
      overflow='hidden'
    >
      <Box
        display='flex'
        alignItems='center'
        justifyContent='center'
        h='100%'
        animation={animation}
      >
        { renderText }
        </Box>
    </Box>
  );
};

export default TextBanner;