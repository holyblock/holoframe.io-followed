import {
  Box,
  Button,
  Container,
  Stack,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react';
import { colors } from '../../styles/theme';

const WCBanner = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box
      mt='15px'
      w={['calc(100vw - 30px)', 'calc(100vw - 60px)']}
      border='1px solid rgba(255,255,255,0.26)'
      borderRadius={['6px', '12px']} 
    >
      <Box bg="bg-surface" boxShadow={useColorModeValue('sm', 'sm-dark')}>
        <Container maxW='100%' py={{ base: '4', md: '2.5' }} position="relative">
          <Stack
            w='100%'
            direction={{ base: 'column', md: 'row' }}
            justify={{ base: 'center', md: 'space-between' }}
            spacing={{ base: '3', md: '2' }}
            align={{ base: 'center', sm: 'center' }}
          >
            <Stack
              direction={{ base: 'column', md: 'row' }}
              spacing={{ base: '0.5', md: '1.5' }}
              pe={{ base: '4', sm: '0' }}
              align={{ base: 'center', sm: 'center' }}
              textAlign={{ base: 'center', md: 'left' }}
            >
              <Text fontWeight="bold">
                Hologram just launched {' '}
                <span style={{ color: colors.brand.primary }}>World Cup Carnival</span>
                {' '}and{' '}
                <span style={{ color: colors.brand.primary }}>3D Jerseys Drop</span>
                {' '} in celebration of the 2022 World Cup!
              </Text>
              {/* <Text color="muted">Learn more</Text> */}
            </Stack>
            <Stack
              direction={{ base: 'row', sm: 'row' }}
              spacing={{ base: '0', md: '2' }}
              align={{ base: 'centerZ', sm: 'center' }}
            >
              <Button
                // backgroundColor="black"
                color="white"
                variant="primary"
                width="full"
                onClick={() => {
                  window.open('https://twitter.com/HologramLabs/status/1597696120628862976', '_blank');
                }}
                _hover={{
                  color: colors.brand.primary
                }}
              >
                Enter Carnival
              </Button>
              <Button
                color="white"
                variant="primary"
                width="full"
                onClick={() => {
                  window.open('https://hologram.xyz/worldcup', '_blank');
                }}
                _hover={{
                  color: colors.brand.primary
                }}
              >
                View Drop
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default WCBanner;