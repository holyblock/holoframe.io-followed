import { Flex, useBreakpointValue } from '@chakra-ui/react';
import React, { useState } from 'react';
import Carousel from 'react-simply-carousel';
import { useStyle } from '../../contexts/StyleContext';
import { colors } from '../../styles/theme';

interface CarouselProps {
  assets: any[]
}

const AssetCarousel = (props: CarouselProps) => {
  const {
    assets
  } = props;
  const { size, darkEnabled } = useStyle();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const responsiveNumItems = useBreakpointValue({ base: 2, sm: 3, md: 4, lg: 5 });

  let itemsToShow = responsiveNumItems;
  if (size) {
    switch(size) {
      case 'sm':
        itemsToShow = Math.max(responsiveNumItems - 2, 1);
        break;
      case 'md': 
        itemsToShow = Math.max(responsiveNumItems - 1, 3);
        break;
      default: 
        itemsToShow = responsiveNumItems;
    };
  };
  
  const renderAssets = assets?.map((asset: any, i: number) => {
    return (
      <Flex 
        key={i}
        w='170px'
        h='170px'
        m='10px'
        justifyContent='center'
        alignItems='center'
      >
        {asset}
      </Flex>
    );
  });

  return (
    <Carousel
      activeSlideIndex={activeSlideIndex}
      onRequestChange={setActiveSlideIndex}
      itemsToShow={itemsToShow}
      itemsToScroll={itemsToShow}
      innerProps={{
        style: {
          margin: '0px 10px !important'
        }
      }}
      itemsListProps={{
        style: {
          margin: '0px 10px !important'
        }
      }}
      containerProps={{
        style: {
          width: "100%",
          display: 'flex',
          alignItems: 'center',
          justifyContent: "space-between",
          height: '170px',
        }
      }}
      forwardBtnProps={{
        children: ">",
        style: {
          width: 20,
          height: 20,
          minWidth: 20,
          color: darkEnabled ? 'white' : 'black',
          alignSelf: "center",
          '&:hover': {
            color: colors.brand.primary
          }
        }
      }}
      backwardBtnProps={{
        children: "<",
        style: {
          width: 20,
          height: 20,
          minWidth: 20,
          color: darkEnabled ? 'white' : 'black',
          alignSelf: "center",
          '&:hover': {
            color: colors.brand.primary
          }
        }
      }}
      speed={200}
    >
      {renderAssets}
    </Carousel>
  );
};

export default AssetCarousel;