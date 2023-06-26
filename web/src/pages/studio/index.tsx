import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic'
import {useCallbackRef} from 'use-callback-ref';
import { 
  Alert,
  AlertIcon,
  AlertDescription,
  Box,
  Flex,
  CloseButton,
  Heading,
  Fade,
  Spinner
} from '@chakra-ui/react';
import { faceKey, aApiKey } from '../../../settings';
import { MORALIS_CHAIN_NAMES_BY_ID } from '../../config/web3Constants';
import AppNavigationBar from '../../components/NavigationBar/AppNavigationBar';
import AppFooter from '../../components/NavigationFooter/AppFooter';
import { alchemyApi } from '../../utils/alchemyApi';
import { getModelFromMetadata } from '../../utils/assetHelper';
import config from '../../../../utils/config';
import { useAuth } from '../../contexts/AuthContext';

const StudioComponent = dynamic(() => import('../../components/HologramStudio'), {
  ssr: false
}) as any;

// Character studio page for artists to view their models with face-tracking
const Studio = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { address, isConnected, chainID } = useAuth();
  const [, setCollectibles] = useState([]);
  const [, setHologramNFTs] = useState([]);
  const [, setBackgroundNFTs] = useState([]);

  const api = useRef<any>();
  const pageKey = useRef<string>(''); // Track last pagination position

  // Infinite scroll / dynamic loading
  const hologramNFTsRef = useCallbackRef<any>([], (node) => setHologramNFTs(node));
  const backgroundNFTsRef = useCallbackRef<any>([], (node) => setBackgroundNFTs(node));
  const collectiblesRef = useCallbackRef<any>([], (node) => setCollectibles(node));
  const parsedTokenIDs = useRef(new Set()); // Ensure no duplicates
  const totalNumNFTs = useRef<number>(0);
  const retryRef = useRef(false); // Determines whether to keep retrying fetch NFTs
  const intervalID = useRef<NodeJS.Timer | null>(null);
  
  useEffect(() => {
    (async () => {
      onRefresh();
      api.current = alchemyApi(aApiKey!, chainID);

      // Get NFTs
      if (isConnected && chainID) {
        initializeFetchNFTLoop();
      } else {
        setLoading(false);
      }

      // Clear any running intervals if extension is switched off
      window.addEventListener('beforeunload', (event) => {
        if (intervalID.current) clearInterval(intervalID.current);
      });
    })();
  }, [isConnected, chainID]);

  // Separate avatar NFTs from backgrounds
  const parseNFTs = async (allNFTs) => {
    for (let nft of allNFTs) {
      // Check for duplicates or add to set
      const uniqueNFTIdentifier = `${nft.contract.address}-${nft.id.tokenId}`;
      if (parsedTokenIDs.current.has(uniqueNFTIdentifier)) {
        continue;
      } else {
        parsedTokenIDs.current.add(uniqueNFTIdentifier);
      }

      const metadata = {
        ...nft.metadata,
        id: nft.id.tokenId,
        name: nft.title,
        description: nft.description
      };
      if (!metadata.image) {
        metadata.image = nft.media[0]?.gateway;
      }

      // Partner-project whitelist
      if (chainID) {
        const network = MORALIS_CHAIN_NAMES_BY_ID[chainID];
        const partnerProjectsConfig = config.partners[network] ?? {};
        const { symbol } = nft.contractMetadata;
        if (Object.keys(partnerProjectsConfig).includes(symbol)) {
          const partnerConfig = config.partners[network][symbol];
          // hash from NFT collection name + version number + NFT ID to hashed string
          const modelURL = getModelFromMetadata(
            partnerConfig.standard,
            network,
            nft
          );
          metadata.type = partnerConfig.type;
          metadata.model_url = modelURL;
          metadata.project = symbol;
        }
      }

      // Check for Hologram compatibility (metadata type and model_url)
      if (
        Object.values(config.nfts.supported).includes(metadata?.type) &&
        metadata?.model_url
      ) {
        hologramNFTsRef.current = [...hologramNFTsRef.current, metadata];
      } else {
        backgroundNFTsRef.current = [...backgroundNFTsRef.current, metadata];
      }
      collectiblesRef.current = [...collectiblesRef.current, metadata];
    }
  }

  // Fetch next batch of NFTs
  const fetchNFTs = async () => {
    if (!api.current) return;
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('owner', address!);
      searchParams.append('withMetadata', 'true');
      if (pageKey.current) {
        searchParams.append('pageKey', pageKey.current);
      }
      const { data } = await api.current.get(`/getNFTs?${searchParams.toString()}`)
      const { pageKey: newPageKey, ownedNfts, totalCount } = data;

      // Reset if response shows updated total number of NFTs
      if (totalNumNFTs.current !== totalCount) {
        totalNumNFTs.current = totalCount;
        parsedTokenIDs.current = new Set();
        setLoading(true);

        // Populate new raw NFT data
        retryRef.current = true;
        if (!intervalID.current) initializeFetchNFTLoop();
      }

      // Parse NFT and track previous pagination position
      await parseNFTs(ownedNfts);
      pageKey.current = newPageKey;

      if (!newPageKey) {
        // All NFTs have been loaded
        retryRef.current = false;
      }
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };
  
  // Retry loop for querying Moralis
  const initializeFetchNFTLoop = () => {
    const timeout = setInterval(async () => {
      await fetchNFTs();
      // Clear retry loop
      if (retryRef.current === false) {
        clearInterval(timeout);
        intervalID.current = null;
      }
    }, config.nfts.fetchTimeInMS);
    intervalID.current = timeout;
  };

  const onRefresh = async () => {
    // Remove cached NFTs and reset state
    pageKey.current = '';
    retryRef.current = true;
    collectiblesRef.current = [];
    hologramNFTsRef.current = [];
    backgroundNFTsRef.current = [];
    parsedTokenIDs.current = new Set();
    setLoading(true);
  };

  return (
    <Fade in={true}>
      <AppNavigationBar />
      { loading &&
        <Flex
          position='fixed'
          top='50%'
          left='50%'
          transform='translate(-50%, -50%)' 
          flexDir='column'
          alignItems='center'
          zIndex={99}
        >
          <Spinner color='white' />
          <Heading color='white' pt={4} size='sm'>
            Loading studio...
          </Heading>
        </Flex>
      }
      <Fade in={!loading}>
        <Flex 
          pt={10}
          pb={5}
          alignItems="center"
          flexDir="column"
          height='100%'
          minH='100vh'
        >
          <Heading 
            as='h1' 
            fontSize={['24px', '36px', '48px']}
            mt='20px'
          >
            { hologramNFTsRef.current.length > 0
              ?
                'My Characters'
              :
                'Studio Mode'
            }
          </Heading>
          <Box pt={10} pb='150px' height='100%'>
            <StudioComponent
              apiKey={faceKey!}
              nftMetadataList={hologramNFTsRef.current}
              toolbarEnabled
              uploadEnabled
              trackingMode='face'
              selectDisplayMode='grid'
              disableBannerKey='rollingtech21'
              darkmodeEnabled
            />
          </Box>
          { error && (
            <div>
              <Alert status='error'>
                <AlertIcon />
                <AlertDescription>{error}</AlertDescription>
                <CloseButton 
                  position='absolute' 
                  right='0px' 
                  top='0px' 
                  onClick={() => setError('')}
                />
              </Alert>
            </div>
          )}
        </Flex>
        <AppFooter />
      </Fade>
    </Fade>
  );
};

export default Studio;