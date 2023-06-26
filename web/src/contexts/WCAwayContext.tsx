import { BigNumber, utils } from "ethers";
import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  useAccount,
  useBalance,
  useContractReads,
} from "wagmi";
import { UseQueryResult } from "wagmi/dist/declarations/src/hooks/utils";

import HoloWCAwayABI from "../contracts/HoloWCAway";

export const holoWCAwayContract = {
  address: "0x52ed77c7f55badabad57c4af39442e550736dcda",
  abi: HoloWCAwayABI,
  chainId: 1,
  gif: "https://hologramxyz.s3.amazonaws.com/nft/wc/images/away/away_unrevealed.gif",
  mp4: "https://hologramxyz.s3.amazonaws.com/nft/wc/videos/away/away_unrevealed.mp4"
};

const DEFAULT_INITIAL_TEAMS = 32;

type WCAwayContextType = {
  contractBalanceInETH: number | undefined;
  contractBalanceInUSD: number | undefined;
  mintStarted?: boolean;
  mintEnded?: boolean;
  mintedAmount?: BigNumber;
  maxMintPerAddress?: BigNumber;
  mintCost?: BigNumber;
  withdrawAmount?: number;
  isLocked?: boolean;
  isLoading: boolean;
  getMinNextRoundWinnable: (jerseyId: number) => number | undefined;
};

export const WCAwayContext = createContext<WCAwayContextType | null>(null);

type MulticallResult = [
  boolean,
  boolean,
  BigNumber,
  BigNumber,
  BigNumber,
  boolean[],
  boolean,
  boolean[],
  BigNumber[],
  BigNumber,
];

const numericalSorting = (a: number, b: number) => {
  return a > b ? 1 : b > a ? -1 : 0;
};

export const WCAwayProvider = ({ children }: { children: React.ReactNode }) => {
  const { address } = useAccount();
  // Get balance
  const { data: contractBalance } = useBalance({
    addressOrName: holoWCAwayContract.address,
  })
  const [qualifiedStore, setQualifiedStore] = useState<boolean[]>();
  const [tradeableStore, setTradeableStore] = useState<number[]>();
  const [contractBalanceInETH, setContractBalanceInETH] = useState<number>();
  const [contractBalanceInUSD, setContractBalanceInUSD] = useState<number>();
  const [withdrawAmount, setWithdrawAmount] = useState<number>();
  const [numInitialTeams, setNumInitialTeams] = useState(DEFAULT_INITIAL_TEAMS);

  const {
    data: [
      mintStarted,
      mintEnded,
      mintedAmount,
      maxMintPerAddress,
      mintCost,
      numQualifiedWithdraw,
      isLocked,
      qualifiedTeams,
      numTradableItems,
      numInitialTeamsBN
    ] = [],
    isLoading,
  } = useContractReads({
    contracts: [
      { ...holoWCAwayContract, functionName: 'mintStarted', watch: true },
      { ...holoWCAwayContract, functionName: 'mintEnded', watch: true },
      { ...holoWCAwayContract, functionName: 'getMintedAmount', args: [address] },
      { ...holoWCAwayContract, functionName: 'maxMintPerAddress' },
      { ...holoWCAwayContract, functionName: 'mintCost' },
      { ...holoWCAwayContract, functionName: 'numQualifiedWithdraw' },
      { ...holoWCAwayContract, functionName: 'locked' },
      { ...holoWCAwayContract, functionName: 'getQualifiedTeams' },
      { ...holoWCAwayContract, functionName: 'getNumTradableItems' },
      { ...holoWCAwayContract, functionName: 'numInitialTeams' },
    ],
  }) as UseQueryResult<MulticallResult, any>;

  // Get the withdraw amount in ETH for each jersey
  useEffect(() => {
    if (numQualifiedWithdraw && contractBalance) {
      const numQualifiedWithdrawInt = +numQualifiedWithdraw.toString();
      const currContractBalanceInETH = +contractBalance.formatted;
      setContractBalanceInETH(currContractBalanceInETH);
      const currWithdrawAmount = currContractBalanceInETH / numQualifiedWithdrawInt;
      setWithdrawAmount(currWithdrawAmount);
    }
  }, [numQualifiedWithdraw, contractBalance]);

  // Fetch contract balance in USD
  useEffect(() => {
    if (contractBalanceInETH) {
      fetch(`https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD`)
        .then((res) => res.json())
        .then((data) => {
          const currContractBalanceInUSD = contractBalanceInETH * data.USD;
          setContractBalanceInUSD(currContractBalanceInUSD);
        });
    }
  }, [contractBalanceInETH]);

  // Fetch latest numInitialTeams
  useEffect(() => {
    if (numInitialTeamsBN) {
      setNumInitialTeams(bigNumberToNumber(numInitialTeamsBN as BigNumber));
    }
  }, [numInitialTeamsBN]);

  // Get the opportunity cost of withdrawing a jersey for next round
  useEffect(() => {
    (async () => {
      if (qualifiedTeams) {
        setQualifiedStore(qualifiedTeams);
        const numTradeableItemsInt: number[] = (numTradableItems as BigNumber[])?.map(item => +item.toString());
        setTradeableStore(numTradeableItemsInt);
      }
    })();
  }, [qualifiedTeams, numTradableItems]);

  // Assume jerseyId is still qualified currently
  const getMinNextRoundWinnable = (jerseyId: number) => {
    if (!qualifiedStore || !tradeableStore || !contractBalanceInETH) return;
    const teamId = jerseyId % (bigNumberToNumber(numInitialTeams as any));
    if (qualifiedStore[teamId]) {
      // Get sum of all qualified number, excluding teamId
      const qualifiedTradable = tradeableStore.map((num, i) => qualifiedStore[i] && i !== teamId ? num : 0);
      qualifiedTradable.sort(numericalSorting).reverse();

      // Get number of all remaining teams
      const numRemainingQualified = qualifiedStore.reduce((acc, curr) => curr ? acc + 1 : acc, 0);
      const numNextRoundQualified = Math.max(numRemainingQualified / 2 - 1, 0);

      const nextRoundMaxTradable = qualifiedTradable.slice(0, numNextRoundQualified);
      const numNextRoundMaxTradable = 
        nextRoundMaxTradable.reduce((acc, curr) => acc + curr, 0) + tradeableStore[teamId];
      const minNextRoundWinnable = contractBalanceInETH / numNextRoundMaxTradable;
      return minNextRoundWinnable;
    }
  };

  return (
    <WCAwayContext.Provider
      value={{
        contractBalanceInETH,
        contractBalanceInUSD,
        mintStarted,
        mintEnded,
        mintedAmount,
        maxMintPerAddress,
        mintCost,
        withdrawAmount,
        isLocked,
        isLoading,
        getMinNextRoundWinnable
      }}
    >
      {children}
    </WCAwayContext.Provider>
  );
};

export const useWCAway = () => {
  const context = useContext(WCAwayContext);

  if (!context) {
    throw new Error("You forgot to use WCAwayProvider");
  }

  return context;
};

export default WCAwayProvider;

export const bigNumberToNumber = (bn: BigNumber) => {
  return +bn.toString();
}

export const bigNumberToEth = (bn: BigNumber) => {
  return Number(utils.formatEther(bn));
}