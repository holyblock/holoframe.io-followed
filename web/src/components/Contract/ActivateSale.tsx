import { useEffect, useState } from 'react';
import { Button, Text } from '@chakra-ui/react';
import { useContractWrite, usePrepareContractWrite, useNetwork, useSwitchNetwork } from 'wagmi';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../utils/firebaseClient';
import HoloCollectionABI from '../../contracts/HoloCollection';
import TxnLoader from './TxnLoader';
import NetworkSelect from '../Modal/NetworkSelect';
import { ETHERSCAN_ROOT_URL_BY_CHAIN } from '../../config/web3Constants';
import { colors } from '../../styles/theme';
import configuration from '../../../../utils/config';

interface ActivateSaleProps {
  activating: boolean,
  collectionID: string,
  collectionAddr: string,
  chainID: number,
  setActivating: () => void,
  variant?: string
}

const ActivateSale = (props: ActivateSaleProps) => {
  const {
    activating,
    collectionID,
    collectionAddr,
    chainID,
    setActivating,
    variant
  } = props;
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const [txnHash, setTxnHash] = useState('');
  const [chainSupported, setChainSupported] = useState(true);
  const [networkSelectOpen, setNetworkSelectOpen] = useState(false);

  useEffect(() => {
    if (chain) {
      setChainSupported(
        chainID === chain.id &&
        configuration.chain.supportedIDs.includes(chain.id)
      );
    }
  }, [chain]);

  const onActivateSaleSuccess = ((data) => {
    setTxnHash(data.hash);
    // Update db with sale active
    const collectionDbRef = doc(db, 'Collection', collectionID);
    updateDoc(collectionDbRef, {
      saleActive: true
    });
    setActivating();
  });
  const { config } = usePrepareContractWrite({
    address: collectionAddr,
    abi: HoloCollectionABI,
    functionName: 'flipSaleState',
  });
  const { data, isError, isLoading, writeAsync } = useContractWrite({
    ...config as any,
    onSuccess: onActivateSaleSuccess
  });
  const onActivateSale = async () => {
    setActivating();
    if (writeAsync) await writeAsync();
  }
  return (
    <>
      { activating
        ?
          txnHash 
          ?
            <TxnLoader
              loadingText={'Activating your collection, stay on this page...'}
              successText={'Congrats! Your collection was activated. Refresh this page to continue.'}
              hash={txnHash}
              etherscanLink={`${ETHERSCAN_ROOT_URL_BY_CHAIN[chainID]}/tx/${txnHash}`}
            />
          :
            <Text> 
              Activating...
            </Text>
        :
          chainSupported
          ?
            <Button
              variant={variant ? variant : 'unstyled'}
              ml='12px'
              _hover={{
                color: variant === 'outline' ? 'black' : colors.brand.primary,
                bgColor: variant === 'outline' ? colors.brand.primary : 'inherit'
              }}
              onClick={onActivateSale}
            >
              Activate
            </Button>
          :
            <Button
              variant={variant ? variant : 'unstyled'}
              ml='12px'
              onClick={() => {
                if (switchNetwork) switchNetwork(chainID)
              }}
            >
              Switch Network
            </Button>
      }
      <NetworkSelect
        isOpen={networkSelectOpen}
        onClose={() => setNetworkSelectOpen(false)}
      />
    </>
    
  );
};

export default ActivateSale;