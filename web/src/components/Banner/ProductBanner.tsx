import { Box, Flex } from '@chakra-ui/react';
import Image from 'next/image';
import ProductDescription from './ProductDescription';

interface ProductBannerProps {
  title: string,
  description: string,
  imageURL: string,
  bgColor: string
}
const ProductBanner = (props: ProductBannerProps) => {
  const { title, description, imageURL, bgColor } = props;
  return (
    <Flex
      maxW={['container.xs', 'container.sm', 'container.md', 'container.lg', 'container.xl']}
      bgColor={bgColor}
      borderRadius={['5px', '25px']}
      pt={['20px', null, '50px', '70px']}
      pb={['30px', null, '50px', '70px']}
      pl={['20px', null, '50px', '110px']}
      pr={['20px', null, '50px', '56px']}
      alignItems='center'
      justifyContent='space-between'
      flexDir={['column', null, 'column', 'row-reverse']}
    >
      <Box
        overflow='hidden'
        borderRadius={['5px', '20px']}
        pos='relative'
        minH={['300px', '457px']}
        minW={['300px', '100%', '100%', '487px']}
      >
        <Image src={imageURL} layout='fill' objectFit='cover' alt='feature' />
      </Box>
      <ProductDescription
        title={title}
        description={description}
      />
    </Flex> 
  );
};

export default ProductBanner;