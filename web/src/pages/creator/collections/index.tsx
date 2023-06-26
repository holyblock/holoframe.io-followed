import { useEffect, useRef, useState  } from 'react';
import Link from 'next/link'
import { Button, Container, Tag, Flex, SimpleGrid, Heading, Text, Spinner, VStack, Fade } from '@chakra-ui/react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebaseClient';
import { UI_CHAIN_NAMES_BY_ID } from '../../../config/web3Constants';
import { useAuth } from '../../../contexts/AuthContext';
import { colors } from '../../../styles/theme';
import AppNavigationBar from '../../../components/NavigationBar/AppNavigationBar';

const Collections = () => {
  const { address } = useAuth();
  const [creatorData, setCreatorData] = useState<any>(null);
  const [collectionData, setCollectionData] = useState<any>([]);
  const [fetchedData, setFetchedData] = useState(false);

  // Get data
  useEffect(() => {
    (async() => {
      setFetchedData(false);
      setCreatorData(null);
      setCollectionData([]);
      if (address) {
        const creatorRef = doc(db, 'Creator', address);
        const creatorSnap = await getDoc(creatorRef);
        if (creatorSnap.exists()) {
          const currData = creatorSnap.data();
          setCreatorData(currData);

          for (const collectionID of currData.collections) {
            try {
              const collectionRef = doc(db, 'Collection', collectionID);
              const collectionSnap = await getDoc(collectionRef);
  
              if (collectionSnap.exists()) {
                const currData = collectionSnap.data();
                setCollectionData(collectionData => [...collectionData, currData]);
              }
            } catch (e) {
              console.error(e);
            }
          }
        } else {
          const newCreator = {
            addr: address,
            collections: []
          };
          setCreatorData(newCreator);
        }
      }
      setFetchedData(true);
    })();
  }, [address]);

  const renderCollections = collectionData.map(collection => {
    if (collection.id) {
      return (
        <Link
          key={collection.id}
          href={`/creator/collections/${collection.id}`}
          passHref
        >
          <Container 
            display='flex'
            borderWidth='1px'
            shadow='md'
            flexDir='column'
            w='475px'
            p={5}
            borderRadius={5}
            _hover={{
              cursor: 'pointer',
              shadow: 'lg',
              borderColor: colors.brand.primary
            }}
            
          >
            <Flex pb={3} alignContent={'center'} justifyContent='space-between'>
              <Text fontSize='2xl' fontWeight='bold'>{collection.name}</Text>
              <Tag h={1} variant='outline' bgColor='white'>
                { UI_CHAIN_NAMES_BY_ID[collection.chainID] }
              </Tag>
            </Flex>
            <Flex pt={3}>
              <VStack mr='160px' spacing='1px' align='left'>
                <Text opacity={0.4} fontSize='sm' fontWeight='bold'>Type</Text>
                <Text fontSize='xl' fontWeight='bold'>{collection.type}</Text>
              </VStack>
              <VStack spacing='1px' align='left'>
                <Text opacity={0.4} fontSize='sm' fontWeight='bold'>Symbol</Text>
                <Text fontSize='xl' fontWeight='bold'>{collection.symbol}</Text>
              </VStack>
            </Flex>
          </Container>
        </Link>
      )
    }
  })
  return (
    <Fade in={true}>
      <AppNavigationBar />
      <Flex pt='70px' flexDir='column' alignItems='center' justifyContent='center'>
        <Heading
          as='h1' 
          size='xl' 
          mt={10}
          mb={2}
        >
          Your Collections
        </Heading>
        { !fetchedData
          ? 
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
                Loading collections...
              </Heading>
            </Flex>
          :
            collectionData.length > 0
            ?
              <>
                <Flex w='container.lg' mb={10} px='1rem' justifyContent='space-between'>
                  <div />
                  <Link href='/creator/collections/create' passHref>
                    <Button
                      variant='unstyled'
                      ml='12px'
                      borderRadius='25px'
                      _hover={{
                        color: colors.brand.primary
                      }}
                    >
                      + Create Collection
                    </Button>
                  </Link>
                </Flex>
                
                <SimpleGrid
                  columns={[1, 2]}
                  spacing={8}
                  mb={10}
                >
                  { renderCollections }
                </SimpleGrid>
              </>
            :
              <>
                <Flex 
                  position='fixed'
                  top='50%'
                  left='50%'
                  transform='translate(-50%, -50%)' 
                  flexDir='column'
                  alignItems='center'
                >
                  <Heading py={4} size='sm'>
                    No collections created yet.
                  </Heading>
                  <Link href='/creator/collections/create' passHref>
                    <Button
                      variant='outline'
                      ml='12px'
                      _hover={{
                        color: 'black',
                        bgColor: colors.brand.primary
                      }}
                    >
                      Create collection
                    </Button>
                  </Link>
                </Flex>
              </>
        }
      </Flex>
    </Fade>
  );
};

export default Collections;