import { Box, Button,  Heading, useToast } from "@chakra-ui/react";
import React, { useState } from "react";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { holoWCHomeContract, useWCHome } from "../../contexts/WCHomeContext";
import { colors } from "../../styles/theme";

const WorldCupHome = () => {
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
      showError("Error");
      return;
    }
    setIsClaiming(true);
    claimAsync?.()
      .then((tx) => tx.wait())
      .then((receipt) => {
        console.log(`https://goerli.etherscan.io/tx/${receipt.transactionHash}`);
        showSuccess("Claimed successfully!");
        setIsClaiming(false);
      })
      .catch((err) => {
        showError("Error");
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
  const { writeAsync: batchMintAsync } = useContractWrite(batchMintConfig);

  const handleMint = () => {
    if (batchMintError) {
      showError("Error");
      return;
    }
    setIsMinting(true);
    batchMintAsync?.()
      .then((tx) => tx.wait())
      .then((receipt) => {
        console.log(`https://goerli.etherscan.io/tx/${receipt.transactionHash}`);
        showSuccess(
          "Minted successfully! <a href='htps://etherscan.io/'>Go to transaction</a>"
        );
        setIsMinting(false);
      })
      .catch((err) => {
        showError("Error");
        setIsMinting(false);
      });
  };

  if (
    !numPublicMinted ||
    !maxPublicSupply ||
    !mintedAmount ||
    !maxMintPerAddress
  )
    return <></>;

  if (mintEnded) {
    return (
      <Heading as="h4" fontSize={20} textAlign="center">
        Mint ended
      </Heading>
    );
  }

  return (
    <Box mt={8}>
      {inWhitelist ? (
        !alreadyClaimed ? (
          <Box mb={4}>
            <Button
              variant="solid"
              bgColor={colors.brand.primary}
              onClick={handleClaim}
              w="150px"
              disabled={isClaiming}
            >
              {isClaiming ? "Claiming..." : "Claim"}
            </Button>
          </Box>
        ) : (
          <Heading as="h4" fontSize={20} textAlign="center">
            You already claimed
          </Heading>
        )
      ) : numPublicMinted.lt(maxPublicSupply) ? (
        mintedAmount.lt(maxMintPerAddress) ? (
          <Box>
            <Heading as="h4" fontSize={20} textAlign="center">
              Public mint (
              {`${mintedAmount.toString()} / ${maxMintPerAddress.toString()}`})
            </Heading>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Button
                variant="solid"
                bgColor={colors.brand.primary}
                onClick={handleMint}
                w="150px"
                disabled={isMinting}
              >
                {isMinting ? "Minting..." : "Mint"}
              </Button>
            </Box>
          </Box>
        ) : (
          <Heading as="h4" fontSize={20} textAlign="center">
            You already minted
          </Heading>
        )
      ) : (
        <Heading as="h4" fontSize={20} textAlign="center">
          Minted out
        </Heading>
      )}
    </Box>
  );
};

export default WorldCupHome;
