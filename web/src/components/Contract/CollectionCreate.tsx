import { useEffect, useState } from 'react';
import { Button, Flex } from '@chakra-ui/react';
import { useContractEvent, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { ethers } from 'ethers';

import { arrayUnion, collection, doc, addDoc, setDoc, updateDoc } from 'firebase/firestore';
import NetworkSelect from '../Modal/NetworkSelect';
import TxnLoader from './TxnLoader';
import { db } from '../../utils/firebaseClient';
import { holoFactoryAddrEthereum, holoFactoryAddrGoerli } from '../../../settings';
import HoloFactoryABI from '../../contracts/HoloFactory';
import { ETHERSCAN_ROOT_URL_BY_CHAIN } from '../../config/web3Constants';

interface CollectionCreateProps {
  account: string,
  name: string,
  symbol: string,
  chainID?: number,
  chainSupported: boolean
}

// UI for collection contract creation modal
const CollectionCreate = (props: CollectionCreateProps) => {
  const {
    account,
    name,
    symbol,
    chainID,
    chainSupported
  } = props;
  const [newCollectionID, setNewCollectionID] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [networkSelectOpen, setNetworkSelectOpen] = useState(false);
  const [factoryContractAddr, setFactoryContractAddr] = useState('');
  const [txnHash, setTxnHash] = useState('');

  useEffect(() => {
    switch(chainID) {
      case 1: 
        setFactoryContractAddr(holoFactoryAddrEthereum!);
        break;
      case 5:
        setFactoryContractAddr(holoFactoryAddrGoerli!);
      default:
        setFactoryContractAddr(holoFactoryAddrEthereum!);
    }
  }, [chainID]);

  // Handler for successfully initializing contract write txn
  const onWriteContractSuccess = async (data) => {
    setTxnHash(data.hash)
    setInitialized(true);

    try {
      // Add to collections db (without addr)
      const collectionRef = collection(db, 'Collection');
      const collectionDocRef = await addDoc(collectionRef, {
        name: name,
        symbol: symbol,
        type: 'ERC721',
        owner: account,
        saleActive: false,
        chainID: chainID
      });

      // Add to creators db
      const creatorDocRef = doc(db, 'Creator', account);
      await setDoc(creatorDocRef, {
        addr: account,
        collections: arrayUnion(collectionDocRef.id)
      }, { merge: true });
      setNewCollectionID(collectionDocRef.id);
      console.log('collectionid', collectionDocRef.id);
    } catch (e) {
      console.error('Error adding document', e);
    }
  };
  const { config } = usePrepareContractWrite({
    address: factoryContractAddr,
    abi: HoloFactoryABI,
    functionName: 'createCollection',
    args: [name, symbol, ethers.constants.AddressZero, 10000, 0],
    
  })
  const { data, isError, isLoading, writeAsync } = useContractWrite({
    ...config as any,
    onSuccess: onWriteContractSuccess
  });

  // Handler for CreatedCollection on-chain event
  const onCreatedCollectionEvent = (event, creatorAddr, event3, newCollectionAddr) => {
    console.log('created collection!!!!', creatorAddr, newCollectionAddr);

    // // Matching contract creation event found
    if (creatorAddr === account) {
      // Update db with collection addr and id
      const collectionDbRef = doc(db, 'Collection', newCollectionID);
      updateDoc(collectionDbRef, {
        id: newCollectionID,
        addr: newCollectionAddr
      });
    }
  };
  useContractEvent({
    address: factoryContractAddr!,
    abi: HoloFactoryABI,
    eventName: 'CreatedCollection',
    listener: onCreatedCollectionEvent,
    once: true
  });

  const onCreateCollection = async () => {
    try {
      if (writeAsync) await writeAsync();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <Flex h='100%' flexDir='column' alignItems='center' justifyContent='center'>
      { !initialized && chainSupported &&
        <Button
          disabled={isLoading}
          variant='outline'
          ml='12px'
          onClick={onCreateCollection}
        >
          { !isLoading ? 'Create' : 'Creating...' }
        </Button>
      }
      { !chainSupported &&
        <Button
          disabled={isLoading}
          variant='outline'
          ml='12px'
          onClick={() => setNetworkSelectOpen(true)}
        >
          { !isLoading ? 'Switch Network' : 'Switching Network...' }
        </Button>
      }
      { initialized &&
        <TxnLoader
          hash={txnHash}
          successText='Congrats! Your collection was successfully created.'
          loadingText='Your collection is being created, stay on this page...'
          etherscanLink={`${ETHERSCAN_ROOT_URL_BY_CHAIN[chainID!]}/tx/${txnHash}`}
        />
      }
      <NetworkSelect
        isOpen={networkSelectOpen}
        onClose={() => setNetworkSelectOpen(false)}
      />
    </Flex>
  );
};

export default CollectionCreate;