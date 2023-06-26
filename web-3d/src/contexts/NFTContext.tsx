import {
    createContext,
    useContext,
    useEffect,
    useState,
    useRef,
    MutableRefObject,
    Dispatch,
    SetStateAction,
  } from 'react';
  import localforage from 'localforage';
  import { useCallbackRef } from 'use-callback-ref';
  
  import { AvatarModel } from '../types';
  import { useAuth } from '../contexts/AuthContext';
  import { aApiKey } from '../../settings';
  import { NFTCollection, Placement, NFTMetadata } from '../../../utils/types';
//   import { Scene } from 'renderer/utils/scene';
  import {
    getFeaturedCollections,
    getCommunityCollection,
    getModelFromMetadata,
  } from '../../../utils/helpers/assetHelper';
  import featuredBackgrounds from '../../../utils/assets/featuredBackgrounds.json';
  import config from '../../../utils/config';
  import { alchemyApi } from '../utils/alchemyApi';
  
  export interface NFTContextProps {
    initialized: boolean;
    loadingNFTs: boolean;
    featuredCollections: NFTCollection[];
    setFeaturedCollections: Dispatch<SetStateAction<NFTCollection[]>>;
    communityCollections: NFTCollection[];
    featuredItems: NFTMetadata[];
    collectibles: any[];
    avatars: NFTMetadata[];
    // scene: MutableRefObject<Scene>;
    avatarModel: AvatarModel;
    placement: Placement;
    zoomFactor: number;
    expressions: Map<string, object[]>;
    setAvatars: (newAvatars: NFTMetadata[]) => void;
    selectedHologram: NFTMetadata;
    selectedItems: NFTMetadata[];
    selectedExps: string[];
    setPlacement: (newPlacement: Placement) => void;
    setZoomFactor: (newZoomFactor: number) => void;
    setAvatarModel: (avatar: AvatarModel) => void;
    setSelectedHologram: (hologram: NFTMetadata) => void;
    setSelectedItems: (items: NFTMetadata[]) => void;
    // addItem: (item: NFTMetadata, type: SceneType) => Promise<void>;
    // removeItem: (item: NFTMetadata) => void;
    // hasBackground: boolean;
    // setBackgroundImage: (url: string) => void;
    // setBackgroundColor: (color: string) => void;
    // clearBackground: () => void;
    setExpressions: (newExp: Map<string, object[]>) => void;
    setSelectedExps: (selected: string[]) => void;
    paginate: () => Promise<void>;
    refresh: () => Promise<void>;
    refreshed: boolean;
    reset: () => Promise<void>;
    videoBackgroundMode: boolean;
    setVideoBackgroundMode: (mode: boolean) => void;
    // moveToTop: (item) => void;
    // moveToBottom: (item) => void;
  }
  
  const NFTContext = createContext<NFTContextProps | null>(null);
  
  export const useNFT = () => {
    return useContext(NFTContext);
  };
  
  export const NFTProvider = ({ children }: any) => {
    // Exported states
    const [featuredCollections, _setFeaturedCollections] = useState<
      NFTCollection[]
    >([]); // Featured NFTs
    const [featuredItems, _setFeaturedItems] = useState<NFTMetadata[]>([]); // Featured backgroudns or stickers
    const [communityCollections, _setCommunityCollections] = useState<
      NFTCollection[]
    >([]); // Community token-gated NFTs
    const [collectibles, _setCollectibles] = useState<NFTMetadata[]>([]); // User's NFTs
    const [avatars, _setAvatars] = useState<NFTMetadata[]>([]); // All user's NFTs
    const [avatarModel, _setAvatarModel] = useState<AvatarModel>(null); // Selected avatar model
    const [hasBackground] = useState(false);
    const [placement, _setPlacement] = useState<Placement>(null);
    const [zoomFactor, _setZoomFactor] = useState<number>(1);
    const [expressions, _setExpressions] = useState<Map<string, object[]>>(
      new Map()
    );
    const [selectedHologram, _setSelectedHologram] = useState<NFTMetadata>();
    const [selectedItems, _setSelectedItems] = useState<NFTMetadata[]>([]);
    const [selectedExps, _setSelectedExps] = useState<string[]>([]);
  
    const api = useRef<any>();
    const pageKey = useRef<string>(''); // Track last pagination position
  
    // Internal NFT parsing and fetching
    const [loadingNFTs, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const [refreshed, setRefreshed] = useState(false);
  
    const [videoBackgroundMode, setVideoBackgroundMode] =
      useState<boolean>(false);
  
    const { chainId, address, isAuthenticated } = useAuth();
  
    // Infinite scroll / dynamic loading
    const supportedCommunities = useRef(new Set<string>());
    // const sceneRef = useRef<Scene>(new Scene());
    const communityCollectionsRef = useCallbackRef([], (node) =>
      _setCommunityCollections(node)
    );
    const collectiblesRef = useCallbackRef([], (node) => _setCollectibles(node));
    const parsedTokenIDs = useRef(new Set()); // Ensure no duplicates
    const disablePagination = useRef(false);
    const totalNumNFTs = useRef(0);
    const retryRef = useRef(false); // Determines whether to keep retrying fetch NFTs
    const intervalID = useRef(null);
  
    // Initialization: load cached attributes if there are any
    useEffect(() => {
      (async () => {
        setInitialized(false);
  
        // Fetch featured collections
        const cachedFeaturedCollections: NFTCollection[] =
          await localforage.getItem('featuredCollections');
        if (cachedFeaturedCollections) {
          _setFeaturedCollections(cachedFeaturedCollections);
        } else {
          const collections = await getFeaturedCollections();
          _setFeaturedCollections(collections);
          await localforage.setItem('featuredCollections', collections);
        }
        _setFeaturedItems(featuredBackgrounds);
  
        // Fetch cached community collections
        const cachedCommunityCollections: NFTCollection[] =
          await localforage.getItem('communityCollections');
        if (cachedCommunityCollections) {
          _setCommunityCollections(cachedCommunityCollections);
        }
  
        // Fetch cached background image
        // const cachedBgImage: string = await localforage.getItem('bgImage');
        // if (cachedBgImage) {
        //   sceneRef.current.setBackgroundImage(cachedBgImage);
        // } else {
        //   // Fetch cached background color
        //   const cachedBgColor: string = await localforage.getItem('bgColor');
        //   if (cachedBgColor) sceneRef.current.setBackgroundColor(cachedBgColor);
        // }
  
        // const cachedItems: NFTMetadata[] = await localforage.getItem(
        //   'cachedItems'
        // );
        // if (cachedItems) {
        //   _setSelectedItems(cachedItems);
        //   for (const item of cachedItems) {
        //     await addItem(item);
        //   }
        // }
  
        const cachedPlacement: Placement = await localforage.getItem('placement');
        if (cachedPlacement) {
          _setPlacement(cachedPlacement);
          avatarModel?.setModelPlacement(cachedPlacement.x, cachedPlacement.y);
        }
  
        const cachedZoomFactor: number = await localforage.getItem('ZoomFactor');
        if (cachedZoomFactor) {
          _setZoomFactor(cachedZoomFactor);
          avatarModel?.setSizeFactor(cachedZoomFactor);
        }
        setInitialized(true);
  
        // Register changes with expressions and keyboard shortcuts
        document.addEventListener('expression', (e: any) => {
          if (e.detail.activeExpressions) {
            setSelectedExps(e.detail.activeExpressions);
          }
        });
      })();
    }, []);
  
    // Fetch NFTs upon authentication or chainId switch
    useEffect(() => {
      (async () => {
        console.log(address, chainId, isAuthenticated)
        if (address && chainId && isAuthenticated) {
          api.current = alchemyApi(aApiKey, chainId);
  
          // Check if NFTs already cached in session storage
          const cachedCollectibles: any[] = await localforage.getItem(
            'collectibles'
          );
          if (cachedCollectibles) {
            collectiblesRef.current = cachedCollectibles;
            setLoading(false);
            disablePagination.current = true;
          } else {
            // No cache found, initial fetch of NFTs in user's wallet
            initializeFetchNFTLoop();
            // sceneRef.current = new Scene();
          }
  
          // Clear any running intervals if extension is switched off
          window.addEventListener('beforeunload', () => {
            if (intervalID.current) clearInterval(intervalID.current);
          });
        } else {
          // If unauthenticated, reset
          pageKey.current = '';
          retryRef.current = true;
          disablePagination.current = false;
          setRefreshed(false);
          // collectiblesRef.current = [...defaultAssets, ...defaultBackgrounds];
          collectiblesRef.current = [];
        //   sceneRef.current = new Scene();
        }
      })();
    }, [address, chainId, isAuthenticated]);
  
    // Apply cached attributes to new avatar model
    useEffect(() => {
      if (placement) {
        avatarModel?.setModelPlacement(placement.x, placement.y);
      }
      avatarModel?.setSizeFactor(zoomFactor);
    }, [avatarModel]);
  
    // Retry loop for querying Moralis
    const initializeFetchNFTLoop = () => {
      collectiblesRef.current = [];
      setLoading(true);
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
  
    // Separate avatar NFTs from backgrounds
    const parseNFTs = async (allNFTs) => {
      for (const nft of allNFTs) {
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
          description: nft.description,
        };
        if (!metadata.image) {
          metadata.image = nft.media[0]?.gateway;
        }
  
        // Partner-project whitelist
        const partnerProjectsConfig = config.partners[chainId] ?? {};
        if (!nft.contractMetadata) return;
        const { symbol } = nft.contractMetadata;
        if (Object.keys(partnerProjectsConfig).includes(symbol)) {
          const partnerConfig = config.partners[chainId][symbol];
          const modelURL = getModelFromMetadata(
            partnerConfig.standard,
            chainId,
            nft
          );
          metadata.type = partnerConfig.type;
          metadata.model_url = modelURL;
          metadata.project = symbol;
        }
        collectiblesRef.current = [...collectiblesRef.current, metadata];
  
        // Check for community collection eligibility
        if (!supportedCommunities.current.has(symbol)) {
          const currCommunityCollection = getCommunityCollection(chainId, nft);
          if (currCommunityCollection) {
            supportedCommunities.current.add(symbol);
            communityCollectionsRef.current = [
              ...communityCollectionsRef.current,
              currCommunityCollection,
            ];
          }
        }
      }
    };
  
    const fetchNFTs = async () => {
      if (!api.current) return;
      try {
        const searchParams = new URLSearchParams();
        searchParams.append('owner', address);
        searchParams.append('withMetadata', 'true');
        if (pageKey.current) {
          searchParams.append('pageKey', pageKey.current);
        }
        const { data } = await api.current.get(
          `/getNFTs?${searchParams.toString()}`
        );
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
          setLoading(false);
          retryRef.current = false;
          await localforage.setItem('collectibles', collectiblesRef.current);
          await localforage.setItem(
            'communityCollections',
            communityCollectionsRef.current
          );
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        setLoading(false);
      }
    };
  
    // Load next batch of NFTs
    const paginate = async () => {
      if (disablePagination.current === false) {
        await fetchNFTs();
      }
    };
  
    // Manual refetch all NFT data
    const refresh = async () => {
      if (refreshed) return;
      // Remove cached NFTs and reset state
      await localforage.removeItem('supportedNFTs');
      await localforage.removeItem('backgroundNFTs');
      await localforage.removeItem('collectibles');
      pageKey.current = '';
      retryRef.current = true;
      disablePagination.current = false;
      if (parsedTokenIDs.current.size === 0) {
        collectiblesRef.current = [];
      }
      setLoading(true);
      initializeFetchNFTLoop();
      setRefreshed(true);
    };
  
    /**
     *
     * External setter functions
     *
     */
  
    const setAvatars = (newAvatars: NFTMetadata[]) => {
      if (newAvatars.length > 0) {
        _setAvatars(newAvatars);
      } else {
        _setAvatars([]);
      }
    };
  
    const setAvatarModel = (avatar: AvatarModel) => {
      _setAvatarModel(avatar);
    };
  
    const setPlacement = (newPlacement: Placement) => {
      _setPlacement(newPlacement);
      // Set avatar model placement
      avatarModel?.setModelPlacement(newPlacement.x, newPlacement.y);
      localforage.setItem('placement', newPlacement);
    };
  
    const setZoomFactor = (newZoomFactor: number) => {
      _setZoomFactor(newZoomFactor);
      avatarModel?.setSizeFactor(newZoomFactor);
      localforage.setItem('ZoomFactor', newZoomFactor);
    };
  
    const setSelectedHologram = (newHologram: NFTMetadata) => {
      // Remove previous expressions cache
      localforage.removeItem('expressions');
      localforage.removeItem('selectedExpressions');
  
      _setSelectedHologram(newHologram);
      localforage.setItem('cachedModel', newHologram);
    };
  
    const setSelectedItems = (newItems: NFTMetadata[]) => {
      _setSelectedItems(newItems);
      localforage.setItem('cachedItems', newItems);
    };
  
    // const setBackgroundImage = (url: string) => {
    //   sceneRef.current.setBackgroundImage(url);
    //   localforage.setItem('bgImage', url);
    //   localforage.removeItem('bgColor');
    // };
  
    // const clearBackground = () => {
    //   sceneRef.current.clearBackground();
    //   localforage.removeItem('bgImage');
    //   localforage.removeItem('bgColor');
    // };
  
    // const setBackgroundColor = (color: string) => {
    //   sceneRef.current.setBackgroundColor(color);
    //   localforage.setItem('bgColor', color);
    //   localforage.removeItem('bgImage');
    // };
  
    // const addItem = async (item: NFTMetadata, type: SceneType) => {
    //   await sceneRef.current.addItem(item.image, type);
    //   const newItems = [...(selectedItems ?? []), item];
    //   _setSelectedItems((i) => [...(i ?? []), item]);
  
    //   localforage.setItem('cachedItems', newItems);
    // };
  
    // const removeItem = (item: NFTMetadata) => {
    //   const newItems = selectedItems.filter((i) => i !== item);
    //   _setSelectedItems(newItems);
    //   sceneRef.current.removeItem(item.image);
    //   localforage.setItem('cachedItems', newItems);
    // };
  
    const setExpressions = (newExp: Map<string, object[]>) => {
      _setExpressions(newExp);
    };
  
    const setSelectedExps = (selected: string[]) => {
      _setSelectedExps(selected);
      avatarModel?.activateExpressions(selected);
      localforage.setItem('selectedExps', selected);
    };
  
    // const moveToTop = (item: NFTMetadata) => {
    //   sceneRef.current.moveToTop(item.image);
    // };
  
    // const moveToBottom = (item: NFTMetadata) => {
    //   sceneRef.current.moveToBottom(item.image);
    // };
  
    // Clear NFT cache in preparation for account or chainId switch
    const reset = async () => {
      _setAvatarModel(null);
      _setCollectibles([]);
      _setSelectedHologram(undefined);
      _setSelectedItems(undefined);
      _setSelectedExps(undefined);
      _setPlacement(null);
      _setZoomFactor(1);
      _setExpressions(new Map());
      _setSelectedExps([]);
      await localforage.removeItem('collectibles');
      await localforage.removeItem('selectedExs');
      await localforage.removeItem('ModelSize');
      await localforage.removeItem('placement');
      await localforage.removeItem('avatarIndex');
    //   sceneRef.current = new Scene();
      parsedTokenIDs.current = new Set();
    };
  
    const value = {
      initialized,
      loadingNFTs,
      collectibles,
    //   scene: sceneRef,
      featuredCollections,
      setFeaturedCollections: _setFeaturedCollections,
      communityCollections,
      featuredItems,
      avatars,
      avatarModel,
      placement,
      zoomFactor,
      expressions,
      setAvatars,
      selectedHologram,
      selectedItems,
      selectedExps,
      setPlacement,
      setZoomFactor,
      setAvatarModel,
      setSelectedHologram,
      setSelectedItems,
    //   addItem,
    //   removeItem,
    //   hasBackground,
    //   setBackgroundImage,
    //   setBackgroundColor,
    //   clearBackground,
      setExpressions,
      setSelectedExps,
      paginate,
      refresh,
      refreshed,
      reset,
      videoBackgroundMode,
      setVideoBackgroundMode,
    //   moveToTop,
    //   moveToBottom,
    };
    return <NFTContext.Provider value={value}>{children}</NFTContext.Provider>;
  };
  