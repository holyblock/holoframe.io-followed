import { useEffect, useState } from 'react';
import Link from 'next/link'
import { useRouter } from 'next/router';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { Button, Container, Fade, Image, SimpleGrid, IconButton, Flex, Heading, Spinner, Text, VStack } from '@chakra-ui/react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../utils/firebaseClient';
import config from '../../../../../../utils/config';
import ActivateSale from '../../../../components/Contract/ActivateSale';
import { useNetwork, useSwitchNetwork } from 'wagmi';
import { colors } from '../../../../styles/theme';
import AppNavigationBar from '../../../../components/NavigationBar/AppNavigationBar';

const Collection = () => {
  const router = useRouter();
  const [fetched, setFetched] = useState(false);
  const { cid } = router.query;
  const { switchNetwork } = useSwitchNetwork();
  const { chain } = useNetwork();
  const [collectionData, setCollectionData] = useState<any>();
  const [tokenDataArr, setTokenDataArr] = useState<any>([]); // Token array
  const [saleActive, setSaleActive] = useState(false);
  const [activating, setActivating] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (chain && collectionData) {
      setSupported(
        config.chain.supportedIDs.includes(chain.id) &&
        collectionData.chainID === chain.id
      );
    }
  }, [chain, collectionData]);

  // Fetch tokens
  useEffect(() => {
    (async () => {
      if (cid && !fetched) {
        // Fetch collection
        const collectionDocRef = doc(db, 'Collection', cid as string);
        const collectionSnap = await getDoc(collectionDocRef);
        if (collectionSnap.exists()) {
          const currCollectionData = collectionSnap.data();
          setCollectionData(currCollectionData);
          setSaleActive(currCollectionData.saleActive);

          // Fetch tokens
          if (currCollectionData.saleActive) {
            const tokens = currCollectionData.tokens;
            if (tokens) {
              for (const tokenID of tokens) {
                const tokenDocRef = doc(db, 'Token', tokenID);
                const tokenSnap = await getDoc(tokenDocRef);
                if (tokenSnap.exists()) {
                  const currTokenData = tokenSnap.data();
                  setTokenDataArr(tokenDataArr => [...tokenDataArr, currTokenData]);
                  setFetched(true);
                }
              }
            }
          }
        }
        setFetched(true);
      }
    })();
  }, [cid]);

  const renderTokens = tokenDataArr?.map(token => {
    return (
      <Container 
        key={token.id}
        display='flex'
        shadow='md'
        flexDir='column'
        w='300px'
        p={5}
        borderRadius={5}
        borderColor='white'
      >
        <Image pb={3} alt='tokenImg' src={token.image} objectFit='cover' w='100%' h={270} />
        <Text pb={1} fontSize='xl' fontWeight='bold'>{token.name}</Text>
        <Text pb={3} fontSize='sm'>{token.description}</Text>
        <Flex justifyContent='space-between'>
          <VStack spacing='1px' align='left'>
            <Text opacity={0.4} fontSize='sm' fontWeight='bold'>Type</Text>
            <Text fontSize='lg' fontWeight='bold'>{token.type}</Text>
          </VStack>
        </Flex>
      </Container>
    )
  });

  return (
    <Fade in={true}>
      <AppNavigationBar />
      <Flex pt='70px' flexDir='column' alignItems='center'>
        { !fetched && 
          <Flex 
            position='fixed'
            top='50%'
            left='50%'
            transform='translate(-50%, -50%)' 
            flexDir='column'
            alignItems='center'
          >
            <Spinner />
            <Heading pt={4} size='sm'>
              Loading collection...
            </Heading>
          </Flex>
        }
        { fetched &&
          <>
            <Heading py={10}>{collectionData.name}</Heading>
            <Flex w='container.lg' mb={10} px='1rem' justifyContent='space-between'>
              <IconButton
                aria-label='back'
                variant='unstyled'
                borderRadius='25px'
                _hover={{
                  color: colors.brand.primary
                }}
                icon={<ArrowBackIcon fontSize='2xl' />}
                onClick={() => router.back()}
              />
              { !saleActive 
                ?
                  <ActivateSale 
                    activating={activating}
                    collectionID={collectionData.id}
                    collectionAddr={collectionData.addr}
                    chainID={collectionData.chainID}
                    setActivating={() => setActivating(true)}
                  />
                :
                  <Button
                    variant='unstyled'
                    ml='12px'
                    borderRadius='25px'
                    _hover={{
                      color: colors.brand.primary
                    }}
                    onClick={() => {
                      if (supported) {
                        window.open(`/creator/collections/${cid}/mint`, '_self');
                      } else {
                        if (collectionData && switchNetwork) {
                          switchNetwork(collectionData.chainID);
                        }
                      }
                    }}
                  >
                    { supported 
                      ? '+ Create Hologram'
                      : 'Switch Network'
                    }
                    
                  </Button>
                }
            </Flex>
            { !saleActive && 
              <Flex 
                position='fixed'
                top='50%'
                left='50%'
                transform='translate(-50%, -50%)' 
                flexDir='column'
                alignItems='center'
              >
                { !activating &&
                  <Heading py={4} size='sm'>
                    Activate your collection to begin creating Holograms!
                  </Heading>
                }
                <ActivateSale 
                  activating={activating}
                  collectionID={collectionData.id}
                  collectionAddr={collectionData.addr}
                  chainID={collectionData.chainID}
                  setActivating={() => setActivating(true)}
                  variant='outline'
                />
              </Flex>
            }   
            { saleActive && tokenDataArr.length > 0 &&
              <SimpleGrid
                columns={[1, 2, 3]}
                spacing={8}
                mb={10}
              >
                { renderTokens }
              </SimpleGrid>
            }
            { saleActive && tokenDataArr.length === 0 &&
              <Flex 
                position='fixed'
                top='50%'
                left='50%'
                transform='translate(-50%, -50%)' 
                flexDir='column'
                alignItems='center'
              >
                <Heading py={4} size='sm'>
                  No Holograms created yet.
                </Heading>
                <Link href={`/creator/collections/${cid}/mint`} passHref>
                  <Button
                    variant='outline'
                    ml='12px'
                    borderColor='white'
                    _hover={{
                      color: 'black',
                      bgColor: colors.brand.primary
                    }}
                  >
                    Create Hologram
                  </Button>
                </Link>
              </Flex>
            }
          </>
        }
      </Flex>
    </Fade>
  );
};

export default Collection;