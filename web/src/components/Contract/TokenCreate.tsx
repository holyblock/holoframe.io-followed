import { useState } from 'react';
import { Button, Flex } from '@chakra-ui/react';
import { useContractEvent, usePrepareContractWrite, useContractWrite, useNetwork } from 'wagmi';
import { useMoralisWeb3Api } from 'react-moralis';

import { doc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../utils/firebaseClient';
import HoloCollectionABI from '../../contracts/HoloCollection';
import { ETHERSCAN_ROOT_URL_BY_CHAIN, MORALIS_CHAIN_NAMES_BY_ID } from '../../config/web3Constants';
import TxnLoader from './TxnLoader';
import { colors } from '../../styles/theme';

interface TokenCreateProps {
  account: string,
  collection: any,
  uniqueTokenID: string,
  tokenURI: string,
  ready: boolean,
}

// Contract and event handlers for minting token
const TokenCreate = (props: TokenCreateProps) => {
  const {
    account,
    collection,
    uniqueTokenID,
    tokenURI,
    ready,
  } = props;
  const { chain } = useNetwork();
  const Web3Api = useMoralisWeb3Api();
  const [initialized, setInitialized] = useState(false);
  const [txnHash, setTxnHash] = useState('');
  const [contractAddr, setContractAddr] = useState('');
  
  // Handler for successfully initializing contract write txn
  const onWriteContractSuccess = async (data) => {
    setTxnHash(data.hash)
    setInitialized(true);
  };
  const { config } = usePrepareContractWrite({
    address: collection?.addr,
    abi: HoloCollectionABI,
    functionName: 'mint',
    args: [account, 0, tokenURI],
  })
  const { data, isError, isLoading, writeAsync } = useContractWrite({
    ...config as any,
    onSuccess: onWriteContractSuccess
  });

  // Handler for CreatedToken on-chain event
  const onMintedTokenEvent = (from, to, tokenID, event) => {

    // Matching token minting event found
    if (to === account) {
      const collectionTokenID = tokenID.toNumber();
      const addr: string = event?.address;
      setContractAddr(addr);
      // Update db with Token addr and id
      const TokenDbRef = doc(db, 'Token', uniqueTokenID);
      setDoc(TokenDbRef, {
        collectionTokenID: collectionTokenID,
        minted: true,
      }, { merge: true });

      // Add tokenID to collection document in db
      const collectionDocRef = doc(db, 'Collection', collection.id);
      setDoc(collectionDocRef, {
        tokens: arrayUnion(uniqueTokenID)
      }, { merge: true });
      
      // Sync metadata on Moralis
      if (chain) {
        const options = {
          address: addr,
          token_id: `${collectionTokenID}`,
          chain: MORALIS_CHAIN_NAMES_BY_ID[chain!.id]
        };
        Web3Api.token.reSyncMetadata(options);
      }
    }
  };
  useContractEvent({
    address: collection.addr,
    abi: HoloCollectionABI,
    eventName: 'Transfer',
    listener: onMintedTokenEvent
  });

  const onMintToken = async () => {
    try {
      if (writeAsync) await writeAsync();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <Flex h='100%' flexDir='column' alignItems='center' justifyContent='center'>
      { !initialized &&
        <Button
          disabled={isLoading || !ready}
          variant='outline'
          ml='12px'
          onClick={onMintToken}
          _hover={{
            borderColor: 'black',
            bgColor: colors.brand.primary
          }}
        >
          { !isLoading ? 'Mint Hologram' : 'Minting Hologram...' }
        </Button>
      }
      { initialized &&
        <TxnLoader
          hash={txnHash}
          successText='Congrats! Your Hologram was successfully minted.'
          loadingText='Your Hologram is minting, stay on this page...'
          etherscanLink={`${ETHERSCAN_ROOT_URL_BY_CHAIN[chain?.id!]}/tx/${txnHash}`}
        />
      }
    </Flex>
  );
};

export default TokenCreate;
