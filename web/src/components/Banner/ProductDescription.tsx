import { Flex, Heading, Text } from '@chakra-ui/react';

interface ProductDescriptionProps {
  title: string,
  description: string
}
const ProductDescription = (props: ProductDescriptionProps) => {
  const { title, description } = props;
  return (
    <Flex
      mt={['25px', null, null, '0px']}
      mr={['0px', null, null, '152px']}
      flexDir='column'
    >
      <Heading lineHeight={['23.75px', '42.75px']} color='white' fontSize={['25px', '45px']}>
        { title }
      </Heading>
      <Text lineHeight={['19.6px', '25.2px']} mt={['14px', '22px']} color='white' fontSize={['14px', '18px']}>
        { description }
      </Text>
    </Flex>
  );
};

export default ProductDescription;