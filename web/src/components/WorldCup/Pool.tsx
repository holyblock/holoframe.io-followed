import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Grid,
  Heading,
  HStack,
  Image,
  Text,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { FaEthereum } from "react-icons/fa";
import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import ConnectWallet from "../Modal/ConnectWallet";

import { useAuth } from '../../contexts/AuthContext';
import { useWCAway, holoWCAwayContract } from '../../contexts/WCAwayContext';
import { colors } from '../../styles/theme';
import PoolDrawer from './PoolDrawer';
import { ETHERSCAN_ROOT_URL_BY_CHAIN } from "../../config/web3Constants";
import { alchemyApi } from '../../utils/alchemyApi';
import { aApiKey } from '../../../settings';

interface WCJerseyProps {
  id: number,
  metadata: any
}

// TODO: use metadata from alchemy instead
const TWITTER_URL = "https://twitter.com/hologramlabs";
const DISCORD_URL = "https://discord.gg/hc5MzksMTH";

const Pool = () => {
  const { isConnected, chainID, address } = useAuth();
  const {
    contractBalanceInETH,
    contractBalanceInUSD,
    withdrawAmount,
    isLocked,
    getMinNextRoundWinnable
  } = useWCAway();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [userWCJerseys, setUserWCJerseys] = useState<WCJerseyProps[]>([]);
  const [jerseyIdsToWithdraw, setJerseyIdsToWithdraw] = useState<number[]>([]);
  const withdrawEnabled = useRef<boolean>(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [txnLink, setTxnLink] = useState("");
  const [render, setRender] = useState(1);

  const minNextRoundWinnable = useRef<number | undefined>(undefined);

  const { config: withdrawConfig } = usePrepareContractWrite({
    address: holoWCAwayContract.address, //TODO: remove hardcoding,
    abi: holoWCAwayContract.abi,
    functionName: 'batchWithdraw',
    args: [jerseyIdsToWithdraw],
    // enabled: withdrawEnabled.current,
  });

  const { data, isSuccess, writeAsync } = useContractWrite({
    ...withdrawConfig as any,
    onSuccess: (tx) => {
      setTxnLink(`${ETHERSCAN_ROOT_URL_BY_CHAIN[chainID]}/tx/${tx.hash}`);
    }
  });

  const showSuccess = (msg: string) =>
    toast({
      description: msg,
      isClosable: true,
      position: "top-right",
      status: "success",
    });

  const showError = (msg: string) =>
    toast({
      description: msg,
      isClosable: true,
      position: "top-right",
      status: "error",
    });


  const onWithdraw = async () => {
    withdrawEnabled.current = true;
    setIsWithdrawing(true);
    await writeAsync?.()
      .then((tx) => tx.wait())
      .then((receipt) => {
        setTxnLink(`${ETHERSCAN_ROOT_URL_BY_CHAIN[chainID]}/tx/${receipt.transactionHash}`);
        showSuccess(
          "Withdraw successfully!"
        );
        // Remove withdrawn Jerseys
        setUserWCJerseys(userWCJerseys.filter((jersey) => !jerseyIdsToWithdraw.includes(Number(jersey.id))));
        setJerseyIdsToWithdraw([]);
        setRender(r => r + 1);

        setIsWithdrawing(false);
        setCheckoutOpen(false);
        setTxnLink("");
      })
      .catch((err) => {
        showError((err as any).reason);
        setIsWithdrawing(false);
      });
  };

   // Fetch HoloWC NFTs
   useEffect(() => {
    (async () => {
      if (chainID && address) {
        // Reset
        setUserWCJerseys([]);
        setJerseyIdsToWithdraw([]);
        setIsWithdrawing(false);
        withdrawEnabled.current = false;

        const params = new URLSearchParams();
        params.append('owner', address);
        params.append('contractAddresses[]', holoWCAwayContract.address);
        params.append('with_metadata', 'true');
        const { data } = await alchemyApi(aApiKey!, chainID).get(`getNFTs?${params.toString()}`);
        if (data?.totalCount >= 1 && data?.ownedNfts) {
          for (const nft of data.ownedNfts) {
            const { id, contractMetadata, metadata } = nft;
            if (!userWCJerseys.some(jersey => jersey.id === id.tokenId)) {
              setUserWCJerseys(userWCJerseys => [...userWCJerseys, { 
                id: id.tokenId,
                name: metadata.name,
                team: metadata.attributes[0].value,
                number: metadata.attributes[1].value,
                metadata: contractMetadata, 
                image: metadata.image
              }]);
            };
          }
        }
      }
    })();
  }, [chainID, address]);

  const onSelectToWithdraw = (id: string, isSelected: boolean) => {
    const idInt = Number(id);
    if (isSelected) {
      setJerseyIdsToWithdraw(jerseyIdsToWithdraw.filter(jerseyId => jerseyId !== idInt));
    } else {
      setJerseyIdsToWithdraw(jerseyIdsToWithdraw => [...jerseyIdsToWithdraw, idInt]);
    }
  };

  const onSelectAll = () => {
    if (userWCJerseys.length === jerseyIdsToWithdraw.length) {
      setJerseyIdsToWithdraw([]);
    } else {
      const allJerseyIds = userWCJerseys.map(jersey => {
        const nextRoundWinnable = getMinNextRoundWinnable(jersey.id);
        if (nextRoundWinnable) {
          return Number(jersey.id);
        }
      });
      setJerseyIdsToWithdraw(allJerseyIds.filter(e => e !== undefined) as number[]);
    }
  }
  const renderJerseys = () => {
    if (userWCJerseys?.length > 0) {
      return userWCJerseys?.map((jersey: any, i: number) => {
        const currJerseyIdInt = Number(jersey.id);
        const isSelected = jerseyIdsToWithdraw.includes(currJerseyIdInt);
        const nextRoundWinnable = getMinNextRoundWinnable(jersey.id);

        if (minNextRoundWinnable?.current && nextRoundWinnable && minNextRoundWinnable?.current <= nextRoundWinnable) {
          minNextRoundWinnable.current = nextRoundWinnable;
        } else {
          minNextRoundWinnable.current = nextRoundWinnable;
        }

        return (
          <Box
            opacity={nextRoundWinnable ? 1 : 0.3}
            key={jersey.id}
            outline={isSelected ? `4px solid ${colors.brand.primary}` : 'none'}
            borderRadius="10px"
            w="250px"
            h="250px"
            textAlign='center'
            _hover={{
              cursor: nextRoundWinnable ? 'pointer' : 'initial',
            }}
            onClick={() => {
              if (nextRoundWinnable) {
                onSelectToWithdraw(jersey.id, isSelected);
              }
            }}
          >
            <Image
              src={jersey.image}
              alt="Jersey"
              borderRadius="10px"
            />
            <Flex
              mt="15px"
              justifyContent="space-between"
              alignItems="center"
            >
              <Text fontFamily="Gustavo">
                Team
              </Text>
              <Text fontFamily="Gustavo" fontSize="18px" display='flex'>
                {/* #{currJerseyIdInt} */}
                {jersey.team}
              </Text> 
            </Flex>
            <Flex
              mt="7px"
              justifyContent="space-between"
              alignItems="center"
            >
              <Text fontFamily="Gustavo">
                Withdraw Now
              </Text>
              <Flex justifyContent="center" alignItems="center">
                <FaEthereum fontSize="18px" style={{ paddingRight: "8px" }} />
                <Text fontFamily="Gustavo" fontSize="18px" display='flex'>
                  {withdrawAmount?.toFixed(3)}
                </Text> 
              </Flex>
            </Flex>
            <Flex
              mt="7px"
              justifyContent="space-between"
              alignItems="center"
            >
              <Text fontFamily="Gustavo">
                If Win Next
              </Text>
              <Flex justifyContent="center" alignItems="center">
                <FaEthereum fontSize="18px" style={{ paddingRight: "8px" }} />
                <Text fontFamily="Gustavo" fontSize="18px" display='flex'>
                  {nextRoundWinnable?.toFixed(3)}
                </Text> 
              </Flex>
            </Flex>
          </Box>
        )
      });
    }
  };

  const getWithdrawNow = () => {
    if (withdrawAmount) {
      const totalWithdraw = jerseyIdsToWithdraw.length * withdrawAmount;
      if (totalWithdraw > 0) {
        return (withdrawAmount * jerseyIdsToWithdraw.length).toFixed(3) 
      } else {
        return 0;
      }
    }
  }

  const getWithdrawNextRound = () => {
    if (jerseyIdsToWithdraw.length > 0) {
      let totalWithdrawNextRound = 0;
      for (const jerseyId of jerseyIdsToWithdraw) {
        const nextRoundWinnable = getMinNextRoundWinnable(Number(jerseyId));
        if (nextRoundWinnable) {
          totalWithdrawNextRound += nextRoundWinnable;
        }
      }
      return totalWithdrawNextRound.toFixed(3);
    } else {
      return 0;
    }
  }

  const renderPrizePool = () => {
    return (
      <>
        { contractBalanceInETH && (
          <Flex
            flexDir="column"
            alignItems="center"
          >
            <Heading fontSize="2xl" mb="12px" color="#A2B6C5">
              Prize Pool (ETH)
            </Heading>
            <Flex justifyContent="center" alignItems="center">
              <FaEthereum fontSize="20px" style={{ paddingRight: "8px" }} />
              <Heading fontSize="2xl">
                {contractBalanceInETH.toFixed(3)}
              </Heading>
            </Flex>
          </Flex>
        )}
        { contractBalanceInUSD && (
          <Flex
            flexDir="column"
            alignItems="center"
          >
            <Heading fontSize="2xl" mb="12px" color="#A2B6C5">
              Prize Pool (USD)
            </Heading>
            <Flex justifyContent="center" alignItems="center">
              <Heading fontSize="2xl">
                $ {contractBalanceInUSD.toLocaleString(undefined, {maximumFractionDigits: 0})}
              </Heading>
            </Flex>
          </Flex>
        )}
      </>
    )
  }

  return (
    <Container
      display='flex'
      alignItems="center"
      justifyContent="center"
      flexDir="column"
      pb={["150px"]}
      maxW='container.lg'
    >
      <Divider mb="70px"/>
      <Heading
        as="h2"
        fontSize={["36px", "48px", "64px", "72px"]}
        mb="70px"
        textAlign="center"
      >
        Hologram Prize Pool
      </Heading>
      { isLocked ? (
        <>
          <HStack spacing="70px">
            { renderPrizePool() }
          </HStack>
          <Text mt="50px">
            Prize pool is locked until the end of the next round.
          </Text>
          <Text mt={5}>
            Stay tuned on {' '}
            <a style={{ textDecoration: "underline"}} href={TWITTER_URL}>Twitter</a>{' '}
            or <a style={{ textDecoration: "underline" }} href={DISCORD_URL}>Discord</a> for updates!
          </Text>
        </>
      ) : (
        <>
          { isConnected && chainID === holoWCAwayContract.chainId ? (
            // Logged onto the correct chain, show withdraw UI
            <>
              { userWCJerseys?.length > 0 ? (
                <>
                  <HStack spacing="70px">
                    { withdrawAmount && (
                      <Flex
                        flexDir="column"
                        alignItems="center"
                      >
                        <Heading fontSize="2xl" mb="12px" color="#A2B6C5">
                          Withdraw Now
                        </Heading>
                        <Flex justifyContent="center" alignItems="center">
                          <FaEthereum fontSize="20px" style={{ paddingRight: "8px" }} />
                          <Heading fontSize="2xl">
                            { getWithdrawNow() }
                          </Heading>
                        </Flex>
                      </Flex>
                    )}
                    { minNextRoundWinnable && (
                      <Flex
                        flexDir="column"
                        alignItems="center"
                      >
                        <Heading fontSize="2xl" mb="12px" color="#A2B6C5">
                          Next Round If Win
                        </Heading>
                          <Flex justifyContent="center" alignItems="center">
                            <FaEthereum fontSize="20px" style={{ paddingRight: "8px" }} />
                            <Heading fontSize="2xl">
                              { getWithdrawNextRound() }
                            </Heading>
                          </Flex>
                      </Flex>
                    )}
                    { renderPrizePool() }
                  </HStack>
                  <Flex
                    flexDir="column"
                    alignItems="center"
                    w="100%"
                  >
                    <Flex alignItems="center">
                      <Button
                        disabled={jerseyIdsToWithdraw.length === 0}
                        variant="solid"
                        bgColor={colors.brand.primary}
                        onClick={() => {
                          setCheckoutOpen(true);
                        }}
                        w="150px"
                        mt="30px"
                        mb="50px"
                      >
                        Withdraw
                      </Button>
                    </Flex>
                    
                    <Grid
                      display='grid'
                      gridTemplateColumns='repeat(auto-fill, minmax(150px, 1fr))'
                      w='100%'
                      rowGap="140px"
                      columnGap="75px"
                      justifyItems='center'
                      alignItems='center'
                    >
                      { render && renderJerseys() }
                    </Grid>
                  </Flex>
                </>
              ) : (
                <>
                  <HStack spacing="70px">
                    { renderPrizePool() }
                  </HStack>
                  <Text mt="50px">
                    You do not have any{' '}
                    <span style={{ color: colors.brand.primary }}>Away Jerseys</span>.{' '}
                    Mint one to enter the prize pool!
                  </Text>
                </>
              )}
              
            </>
          ) : (
            <>
              <HStack spacing="70px">
                { renderPrizePool() }
              </HStack>
              <Text mt="50px">
                Connect to participate in the Hologram World Cup Prize Pool with your Away Jerseys!
              </Text>
              <Button
                variant="solid"
                bgColor={colors.brand.primary}
                onClick={onOpen}
                w="150px"
                mt="30px"
                mb="50px"
              >
                Connect
              </Button>
            </>
          )}
        </>
      )}
      <PoolDrawer
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onWithdraw={onWithdraw}
        userWCJerseys={userWCJerseys}
        jerseyIdsToWithdraw={jerseyIdsToWithdraw}
        withdrawAmountPerJersey={withdrawAmount}
        isWithdrawing={isWithdrawing}
        txnLink={txnLink}
      />
      <ConnectWallet isOpen={isOpen} onClose={onClose} selectedChainId={holoWCAwayContract.chainId} />
    </Container>
  );
};

export default Pool;