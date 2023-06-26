import React from 'react';
import { 
  Box,
  Flex,
  Text
} from '@chakra-ui/react';

import { colors } from '../../utils/theme';

const UnsupportedDomainModal = () => {
  return (
    <Flex
      justifyContent='center'
      alignItems='center'
      w={320}
      h='100%'
    >
      <Box h="100%" display="flex" alignItems="center">
        <Text fontSize="md" textAlign="center">
          This view is available when on any of Hologram's{' '}
          <Box
            as='span'
            color={colors.brand.primary}
            _hover={{
              cursor: 'pointer',
              textDecor: 'underline'
            }}
            onClick={() => chrome.tabs.create({
              active: true,
              url: 'https://docs.hologram.xyz/resources/faqs#which-video-platforms-does-hologram-support'
            })}
          >
            supported sites
          </Box>
        </Text>
      </Box>
    </Flex>
  );
};

export default UnsupportedDomainModal;