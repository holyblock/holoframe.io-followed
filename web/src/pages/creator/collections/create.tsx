import { useEffect, useState } from 'react';
import Link from 'next/link'
import { Box, IconButton, Container, Flex, FormControl, FormLabel, Heading, Input, Select, Text, Fade } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useAccount, useSwitchNetwork, useNetwork } from 'wagmi';

import config from '../../../../../utils/config';
import CollectionCreate from '../../../components/Contract/CollectionCreate';
import { colors } from '../../../styles/theme';
import AppNavigationBar from '../../../components/NavigationBar/AppNavigationBar';

const Create = () => {
  const { address } = useAccount();
  const { switchNetwork } = useSwitchNetwork();
  const { chain, chains } = useNetwork();
  const [collectionName, setCollectionName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (chain) {
      setSupported(config.chain.supportedIDs.includes(chain.id));
    }
  }, [chain]);

  const handleNetworkSelect = (event: any) => {
    if (switchNetwork) {
      const chainID: number = +event.target.value;
      switchNetwork(chainID);
    }
  };

  const renderNetworkOptions = chains.map((chain) => {
    return (
      <option key={chain.id} value={chain.id}>{chain.name}</option>
    )
  });
  
  return (
    <Fade in={true}>
      <AppNavigationBar />
      <Flex pt='70px' flexDir='column' justifyContent='center' alignItems='center'>
        <Flex h='0px' w='container.lg' px='1rem' justifyContent='space-between'>
          <Link href='/creator/collections' passHref>
            <IconButton
              aria-label='back'
              variant='unstyled'
              borderRadius='25px'
              _hover={{
                color: colors.brand.primary
              }}
              icon={<ArrowBackIcon fontSize='2xl' />}
            />
          </Link>
        </Flex>
        <Container
          display='flex'
          alignItems='center'
          flexDir='column'
          py={10}
          maxW={['container.xl', 'container.lg', 'container.sm']}
          textAlign='left'
          shadow='md'
        >
          <Heading 
            as='h1' 
            size='xl' 
            mb={5}
          >
            Create Collection
          </Heading>
          <Text mb={10}>
            Collections are places for you to showcase your Holograms.
          </Text>
          <FormControl mb={5} px={10}>
            <FormLabel fontWeight='bold'>Collection Name</FormLabel>
            <Input 
              h='50px'
              value={collectionName} 
              onChange={(e) => setCollectionName(e.currentTarget.value)}
              focusBorderColor='purple.200'
              required
            />
          </FormControl>
          <FormControl mb={5} px={10}>
            <FormLabel fontWeight='bold'>Symbol</FormLabel>
            <Input 
              h='50px'
              value={symbol} 
              onChange={(e) => setSymbol(e.currentTarget.value)}
              focusBorderColor='purple.200'
              required
            />
          </FormControl>
          { supported && 
            <FormControl mb={5} px={10}>
              <FormLabel fontWeight='bold'>Network</FormLabel>
              <Select
                value={chain?.id}
                onChange={handleNetworkSelect} 
                h='50px'
              >
                {renderNetworkOptions}
              </Select>
            </FormControl>
          }
          <Box h='100%' pt={2}>
            { address &&
              <CollectionCreate 
                account={address!} 
                name={collectionName} 
                symbol={symbol}
                chainID={chain?.id}
                chainSupported={supported}
              />
            }
          </Box>
        </Container>
      </Flex>
    </Fade>
  );
};

export default Create;