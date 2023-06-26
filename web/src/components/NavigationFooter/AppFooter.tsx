import { 
    Box,
    Button,
    ButtonGroup,
    Container,
    Flex,
    IconButton,
    Stack,
    Text
  } from '@chakra-ui/react';
  import Link from 'next/link';
  import { FaDiscord, FaTwitter } from 'react-icons/fa';
  import { colors } from '../../styles/theme';
  import Logo from '../Logo';
  
  const AppFooter = () => {
    return (
      <Box 
        as='footer' 
        role='contentinfo' 
        h={['300px', null, '70px']}
        position='absolute'
        bottom={0}
        w='100%'
        bg={colors.brand.tertiary}
        color='white'
        display='flex'
        alignItems='space-between'
        px={[0, null, "18px"]}
        py={["36px", null, 0]}
      >
        <Stack
          w='100%'
          direction={['column', null, 'row']}
          align='center'
          justify='space-between'
          alignContent={['center', 'space-between']}
        >
          <Logo color='white' />
          <ButtonGroup
            alignItems='center'
            textAlign='center'
            size='sm'
            spacing={[0, null, 10]}
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
            >
              <Button color='white' variant='link'>
                Careers
              </Button>
            </Link>
            <Link href={'https://docs.hologram.xyz/'}>
              <Button color='white' variant='link'>
                Docs
              </Button>
            </Link>
            <Link href={'https://docs.hologram.xyz/resources/faqs'}>
              <Button color='white' variant='link'>
                FAQs
              </Button>
            </Link>
            <Link href={'https://hologram.canny.io/feature-requests'}>
              <Button color='white' variant='link'>
                Feedback
              </Button>
            </Link>
            <ButtonGroup>
              <IconButton 
                as='a'
                aria-label='Discord'
                color='white'
                icon={<FaDiscord fontSize='20px' />}
                bg='transparent'
                _hover={{
                  bg: colors.brand.primary,
                  cursor: 'pointer',
                  color: 'black'
                }}
                onClick={() => {
                  window.open('https://discord.gg/dEGAwss3Et', '_blank');
                }}
              />
              <IconButton 
                as='a'
                aria-label='Twitter'
                color='white'
                icon={<FaTwitter fontSize='20px' />} 
                bg='transparent'
                _hover={{
                  bg: colors.brand.primary,
                  cursor: 'pointer',
                  color: 'black'
                }}
                onClick={() => {
                  window.open('https://twitter.com/hologramlabs', '_blank');
                }}
              />
            </ButtonGroup>
          </ButtonGroup>
          
        </Stack>
      </Box>
    )
  }
  
  export default AppFooter;
  