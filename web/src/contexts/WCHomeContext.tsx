import { BigNumber, ethers } from "ethers";
import React, { createContext, useContext, useMemo, useState } from "react";
import {
  useAccount,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { UseQueryResult } from "wagmi/dist/declarations/src/hooks/utils";

import config from "../config/airdrop";
import HoloWCHomeABI from "../contracts/HoloWCHome";
import { generateProof } from "../utils/token";

export const holoWCHomeContract = {
  address: "0x3d6a7f5c9280e26f09617e02f615455cdbd12e83",
  abi: HoloWCHomeABI,
  chainId: 1,
  gif: "https://hologramxyz.s3.amazonaws.com/nft/wc/images/home/home_unrevealed.gif",
  mp4: "https://hologramxyz.s3.amazonaws.com/nft/wc/videos/home/home_unrevealed.mp4"
};

type WCHomeContextType = {
  inWhitelist?: boolean;
  alreadyClaimed?: boolean;
  mintCost?: BigNumber;
  mintEnded?: boolean;
  numPublicMinted?: BigNumber;
  maxPublicSupply?: BigNumber;
  mintedAmount?: BigNumber;
  maxMintPerAddress?: BigNumber;
  claimError?: Error | null;
  claimAsync?: () => Promise<any>;
  isLoading: boolean;
};

export const WCHomeContext = createContext<WCHomeContextType | null>(null);

type MulticallResult = [
  BigNumber,
  boolean,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  boolean,
  boolean
];

export const WCHomeProvider = ({ children }: { children: React.ReactNode }) => {
  const { address } = useAccount();

  const numAirdrops = useMemo(() => {
    if (!address) return 0;
    const checksumAddress = ethers.utils.getAddress(address);
    const lowercaseChecksumAddress = checksumAddress.toLowerCase();

    if (checksumAddress in config.airdrop) {
      return config.airdrop[checksumAddress];
    } else if (lowercaseChecksumAddress in config.airdrop) {
      return config.airdrop[lowercaseChecksumAddress];
    }
    return 0;
  }, [address]);

  const merkleProof = useMemo(() => {
    return generateProof(address ?? ethers.constants.AddressZero, numAirdrops);
  }, [address, numAirdrops]);

  const {
    data: [
      mintCost,
      mintEnded,
      numPublicMinted,
      maxPublicSupply,
      mintedAmount,
      maxMintPerAddress,
      inWhitelist,
      alreadyClaimed,
    ] = [],
    isLoading,
  } = useContractReads({
    contracts: [
      { ...holoWCHomeContract, functionName: "mintCost" },
      { ...holoWCHomeContract, functionName: "mintEnded" },
      { ...holoWCHomeContract, functionName: "numPublicMinted", watch: true },
      { ...holoWCHomeContract, functionName: "maxPublicSupply" },
      {
        ...holoWCHomeContract,
        functionName: "getMintedAmount",
        args: [address],
        watch: true,
      },
      { ...holoWCHomeContract, functionName: "maxMintPerAddress" },
      {
        ...holoWCHomeContract,
        functionName: "checkInWhitelist",
        args: [address, numAirdrops, merkleProof],
      },
      {
        ...holoWCHomeContract,
        functionName: "claimed",
        args: [address],
        watch: true,
      },
    ],
  }) as UseQueryResult<MulticallResult, any>;

  const { config: claimConfig, error: claimError } = usePrepareContractWrite({
    ...holoWCHomeContract,
    functionName: "claim",
    args: [numAirdrops, merkleProof],
  });
  const { writeAsync: claimAsync } = useContractWrite(claimConfig as any);

  return (
    <WCHomeContext.Provider
      value={{
        mintCost,
        mintEnded,
        numPublicMinted,
        maxPublicSupply,
        mintedAmount,
        maxMintPerAddress,
        inWhitelist,
        alreadyClaimed,
        claimError,
        claimAsync,
        isLoading,
      }}
    >
      {children}
    </WCHomeContext.Provider>
  );
};

export const useWCHome = () => {
  const context = useContext(WCHomeContext);

  if (!context) {
    throw new Error("You forgot to use WCHomeProvider");
  }

  return context;
};

export default WCHomeProvider;
