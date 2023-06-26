import { Box, Button, Flex, Link, Text, useToast } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { FaEthereum } from "react-icons/fa";
import { BigNumber } from 'ethers';
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { holoWCHomeContract, useWCHome } from "../../contexts/WCHomeContext";
import { colors } from "../../styles/theme";
import { ETHERSCAN_ROOT_URL_BY_CHAIN } from "../../config/web3Constants";

interface MintHomeProps {
  address: string;
  chainID: number;
}

const MintHome = (props: MintHomeProps) => {
  const { address, chainID } = props;
  const {
    mintEnded,
    inWhitelist,
    alreadyClaimed,
    numPublicMinted,
    maxPublicSupply,
    mintedAmount,
    maxMintPerAddress,
    claimAsync,
    claimError,
    mintCost,
  } = useWCHome();
  const toast = useToast();
  const [isMinting, setIsMinting] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimed, setIsClaimed] = useState(alreadyClaimed);
  const [currMintedAmount, setCurrMintedAmount] = useState(mintedAmount);
  const [txnLink, setTxnLink] = useState("");

  useEffect(() => {
    setIsMinting(false);
    setIsClaiming(false);
    if (alreadyClaimed) setIsClaimed(alreadyClaimed);
    if (mintedAmount) setCurrMintedAmount(mintedAmount);
    setTxnLink("");
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

  const handleClaim = () => {
    if (claimError) {
      showError((claimError as any).reason);
      return;
    }
    setIsClaiming(true);
    claimAsync?.()
      .then((tx) => tx.wait())
      .then((receipt) => {
        setTxnLink(`${ETHERSCAN_ROOT_URL_BY_CHAIN[chainID]}/tx/${receipt.transactionHash}`);
        showSuccess("Claimed successfully!");
        setIsClaiming(false);
        setIsClaimed(true);
      })
      .catch((err) => {
        showError((err as any).reason);
        setIsClaiming(false);
      });
  };

  const { config: batchMintConfig, error: batchMintError } =
    usePrepareContractWrite({
      ...holoWCHomeContract,
      functionName: "batchMint",
      args: [1],
      overrides: { value: mintCost?.mul(1) },
      onError: () => null, // TODO: If not enough ETH to mint, show error message
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
    setIsMinting(true);
    batchMintAsync?.()
      .then((tx) => tx.wait())
      .then((receipt) => {
        showSuccess(
          "Minted successfully!"
        );
        if (currMintedAmount) {
          setCurrMintedAmount(currMintedAmount?.add(BigNumber.from(1)));
        }
        setIsMinting(false);
      })
      .catch((err) => {
        showError((err as any).reason);
        setIsMinting(false);
      });
  };

  if (
    !numPublicMinted ||
    !maxPublicSupply ||
    !currMintedAmount ||
    !maxMintPerAddress
  )
    return <></>;

  console.log(numPublicMinted, maxPublicSupply, currMintedAmount, maxMintPerAddress)

  if (mintEnded) {
    return (
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
        Mint Ended
      </Button>
    );
  }

  return (
    <Box mt="45px">
      {inWhitelist ? (
        !isClaimed ? (
          <Box mb={4}>
            <Button
              variant="solid"
              bgColor={colors.brand.primary}
              onClick={handleClaim}
              w="250px"
              h="50px"
              disabled={isClaiming}
              borderRadius="36px"
              fontFamily="Gustavo"
              fontSize="14px"
            >
              {isClaiming? "Claiming..." : "Claim Jersey"}
            </Button>
          </Box>
        ) : (
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
            Claimed
          </Button>
        )
      ) : numPublicMinted.lt(maxPublicSupply) ? (
        currMintedAmount.lt(maxMintPerAddress) ? (
          <Box>
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
                {isMinting ? "Minting..." : "Mint Jersey"}
              </Button>
              { mintCost && txnLink === "" && (
                <Flex pt="30px" justifyContent="center" alignItems="center">
                  <FaEthereum fontSize="18px" style={{ paddingRight: "8px" }} />
                  <Text fontFamily="Gustavo" fontSize="18px" display='flex'>
                    Free
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
          </Box>
        ) : (
          <>
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
              Already minted
            </Button>
            { txnLink !== "" && (
              <Flex pt="30px" justifyContent="center" alignItems="center">
                <Link href={txnLink} isExternal>
                  <Text _hover={{ textDecor: "underline" }} fontFamily="Gustavo" fontSize="18px" display='flex'>
                    View on Etherscan
                  </Text> 
                </Link>
              </Flex>
            )}
          </>
        )
      ) : (
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
          Minted out
        </Button>
      )}
    </Box>
  );
};

export default MintHome;