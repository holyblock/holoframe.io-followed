import { 
  Box,
  Button,
  ButtonGroup,
  Container,
  Flex,
  IconButton,
  Link,
  Stack,
  Text
} from '@chakra-ui/react';
import { FaDiscord, FaTwitter } from 'react-icons/fa';
import { colors } from '../../styles/theme';
import Logo from '../Logo';

const StudioFooter = () => {
  return (
    <Box 
      as='footer' 
      role='contentinfo' 
      h={['300px', null, '160px']}
      position='absolute'
      bottom={0}
      w='100%'
      bg='black'
      color='white'
      display='flex'
      alignItems='center'
    >
      <Container maxW='container.lg'>
        <Stack direction={['column', null, 'row']} align='center' justify='space-between' alignContent={['center', 'center']}>
          <Flex flexDir='column'>
            <Logo color='white' />
            <Text
              fontSize='sm'
              alignSelf={{ base: 'center', md: 'start' }}
              pt='8px'
            >
              &copy; {new Date().getFullYear()} Rolling Inc.
            </Text>
          </Flex>
          <ButtonGroup
            mt={['50px', null, '80px']}
            mb={['0px', null, '150px', '200px']}
            textAlign='center'
            size='sm'
            spacing={[0, null, 7]}
            display='flex'
            flexDir={['column', null,  'row']}
          >
            <Link href='/about'>
              <Button color='white' variant='link'>
                About
              </Button>
            </Link>
            <Link 
              href={'https://hologramxyz.notion.site/Work-with-Hologram-8c0f5ee8b8d54609b4675cdca610172d'} 
              isExternal
            >
              <Button color='white' variant='link'>
                Careers
              </Button>
            </Link>
            <Link href={'https://docs.hologram.xyz/'} isExternal>
              <Button color='white' variant='link'>
                Docs
              </Button>
            </Link>
            <Link href={'https://docs.hologram.xyz/resources/faqs'} isExternal>
              <Button color='white' variant='link'>
                FAQs
              </Button>
            </Link>
            <Link href={'https://hologram.canny.io/feature-requests'} isExternal>
              <Button color='white' variant='link'>
                Feedback
              </Button>
            </Link>
          </ButtonGroup>
          <ButtonGroup>
            <IconButton 
              as='a'
              aria-label='Discord'
              icon={<FaDiscord fontSize='20px' />}
              bg='transparent'
              _hover={{
                bg: colors.brand.primary,
                cursor: 'pointer'
              }}
              onClick={() => {
                window.open('https://discord.gg/dEGAwss3Et', '_blank');
              }}
            />
            <IconButton 
              as='a'
              aria-label='Twitter'
              icon={<FaTwitter fontSize='20px' />} 
              bg='transparent'
              _hover={{
                bg: colors.brand.primary,
                cursor: 'pointer'
              }}
              onClick={() => {
                window.open('https://twitter.com/hologramlabs', '_blank');
              }}
            />
          </ButtonGroup>
        </Stack>
      </Container>
    </Box>
    )
}

export default StudioFooter;
