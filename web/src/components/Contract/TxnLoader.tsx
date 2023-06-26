import {} from 'react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Flex, Spinner, Text, Link } from '@chakra-ui/react';
import { useWaitForTransaction } from 'wagmi';

interface TxnLoaderProps {
  hash: string,
  loadingText: string,
  successText: string,
  etherscanLink: string
}
const TxnLoader = (props: TxnLoaderProps) => {
  const {
    hash,
    loadingText,
    successText,
    etherscanLink
  } = props;
  const { data, isError, isLoading } = useWaitForTransaction({ hash: hash as `0x${string}` });
  
  if (isLoading) return (
    <Flex 
      flexDir='column'
      alignItems='center'
    >
      <Spinner />
      <Text pt={4}>
        {loadingText}
      </Text>
      <Link isExternal href={etherscanLink}>
        <ExternalLinkIcon mx='2px' /> View on Etherscan
      </Link>
    </Flex>
  )
   
  if (isError) return (
    <Text mb='12px' fontWeight='extrabold'>
      Transaction error
    </Text>
  )
  return <>
    <Text mb='12px' fontWeight='extrabold'> 
      { successText }
    </Text>
    <Link isExternal href={etherscanLink}>
      <ExternalLinkIcon mx='2px' /> View on Etherscan
    </Link>
  </>
};

export default TxnLoader;