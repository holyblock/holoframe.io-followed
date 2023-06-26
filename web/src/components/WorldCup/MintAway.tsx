import { Box, Button, Flex, useToast, Text, Spinner, Link } from "@chakra-ui/react";
import React, { useEffect, useState, useRef } from "react";
import { FaEthereum } from "react-icons/fa";
import { BigNumber } from 'ethers';
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { holoWCAwayContract, useWCAway } from "../../contexts/WCAwayContext";
import { colors } from "../../styles/theme";
import Counter from "../Counter";
import { ETHERSCAN_ROOT_URL_BY_CHAIN, bigNumberToNumber, bigNumberToEth } from "../../config/web3Constants";

interface MintAwayProps {
  address: string;
  chainID: number;
}

const MintAway = (props: MintAwayProps) => {
  const { address, chainID } = props;
  const {
    mintStarted,
    mintEnded,
    mintedAmount,
    maxMintPerAddress,
    mintCost,
    isLoading
  } = useWCAway();
  const toast = useToast();
  const [numToMint, setNumToMint] = useState(1);
  const [currMintCost, setCurrMintCost] = useState(mintCost);
  const [isMinting, setIsMinting] = useState(false);
  const mintClicked = useRef<boolean>(false);
  const [txnLink, setTxnLink] = useState("");
  const [currMintedAmount, setCurrMintedAmount] = useState(mintedAmount);

  useEffect(() => {
    mintClicked.current = false;
    setIsMinting(false);
    setTxnLink("");
    setCurrMintedAmount(mintedAmount);
    if (mintCost) setCurrMintCost(mintCost);
  }, [address, chainID]);

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

  const { config: batchMintConfig, error: batchMintError } =
    usePrepareContractWrite({
      ...holoWCAwayContract,
      functionName: "batchMint",
      args: [numToMint],
      enabled: mintClicked.current,
      overrides: {
        value: (BigNumber.from(numToMint).mul(currMintCost as BigNumber)),
        // gasLimit: BigNumber.from(5000000),
      },
      onError: (err) => {
        showError((err as any).reason);
      }, // TODO: If not enough ETH to mint, show error message
    });
  const { writeAsync: batchMintAsync } = useContractWrite({
    ...batchMintConfig as any,
    onSuccess: (tx) => {
      setTxnLink(`${ETHERSCAN_ROOT_URL_BY_CHAIN[chainID]}/tx/${tx.hash}`);
    }
  });

  const handleMint = () => {
    if (batchMintError) {
      showError((batchMintError as any).reason);
      return;
    }
    mintClicked.current = true;
    setIsMinting(true);
    batchMintAsync?.()
      .then((tx) => tx.wait())
      .then((receipt) => {
        setTxnLink(`${ETHERSCAN_ROOT_URL_BY_CHAIN[chainID]}/tx/${receipt.transactionHash}`);
        showSuccess(
          "Minted successfully! Refresh to unlock the prize pool."
        );
        if (currMintedAmount) {
          const newTotalMinted = currMintedAmount.add(BigNumber.from(numToMint));
          setCurrMintedAmount(newTotalMinted);
        }
        setIsMinting(false);
        mintClicked.current = false;
      })
      .catch((err) => {
        showError((err as any).reason);
        setIsMinting(false);
        mintClicked.current = false;
      });
  };

  if (!mintStarted) {
    return (
      <Box mt="45px">
        <Button
          disabled
          variant="solid"
          bgColor={colors.brand.primary}
          w="250px"
          h="50px"
          borderRadius="36px"
          fontFamily="Gustavo"
          fontSize="14px"
          _hover={{
            bgColor: colors.brand.primary,
          }}
        >
          Mint Not Started
        </Button>
      </Box>
    )
  }

  if (mintEnded) {
    return (
      <Box mt="45px">
        <Button
          disabled
          bgColor={colors.brand.primary}
          variant="solid"
          w="250px"
          h="50px"
          borderRadius="36px"
          fontFamily="Gustavo"
          fontSize="14px"
          _hover={{ bg: colors.brand.primary }}
        >
          Mint Ended
        </Button>
      </Box>
    )
  }

  if (maxMintPerAddress && currMintedAmount && maxMintPerAddress.eq(currMintedAmount)) {
    return (
      <Box mt="45px">
        <Button
          disabled
          variant="solid"
          bgColor={colors.brand.primary}
          w="250px"
          h="50px"
          borderRadius="36px"
          fontFamily="Gustavo"
          fontSize="14px"
          _hover={{ bg: colors.brand.primary }}
        >
          Max Mint Reached
        </Button>
      </Box>
    )
  }

  return (
    <Box mt="45px">
      { isLoading ? (
        <Flex
          justifyContent="center"
        >
          <Text>Loading...</Text>
          <Spinner />
        </Flex>
      ) : (
        <>
          <Flex justifyContent="center" pb="30px">
            <Counter
              onChange={(num) => setNumToMint(num)}
              defaultValue={numToMint}
              max={maxMintPerAddress && currMintedAmount 
                ? bigNumberToNumber(maxMintPerAddress.sub(currMintedAmount))
                : undefined
              }
            />
          </Flex>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Button
              variant="solid"
              bgColor={colors.brand.primary}
              onClick={handleMint}
              w="250px"
              h="50px"
              disabled={isMinting}
              borderRadius="36px"
              fontFamily="Gustavo"
              fontSize="14px"
            >
              {isMinting === true ? "Minting..." : "Mint Jersey"}
            </Button>
            { currMintCost && txnLink === "" && (
              <Flex pt="30px" justifyContent="center" alignItems="center">
                <FaEthereum fontSize="18px" style={{ paddingRight: "8px" }} />
                <Text fontFamily="Gustavo" fontSize="18px" display='flex'>
                  {(bigNumberToEth(currMintCost) * numToMint).toFixed(3)}
                </Text> 
              </Flex>
            )}
            { txnLink !== "" && (
              <Flex pt="30px" justifyContent="center" alignItems="center">
                <Link href={txnLink} isExternal>
                  <Text _hover={{ textDecor: "underline" }} fontFamily="Gustavo" fontSize="18px" display='flex'>
                    View on Etherscan
                  </Text> 
                </Link>
              </Flex>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default MintAway;