import React from 'react';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerOverlay,
  DrawerFooter,
  Flex,
  Link,
  HStack,
  Text,
  Image,
} from '@chakra-ui/react';
import { FaEthereum } from "react-icons/fa";
import { colors } from '../../styles/theme';
import { holoWCAwayContract } from '../../contexts/WCAwayContext';

interface PoolDrawerProps {
  isOpen: boolean,
  onClose: () => void,
  onWithdraw: () => void,
  userWCJerseys: any[],
  jerseyIdsToWithdraw: number[],
  withdrawAmountPerJersey?: number,
  isWithdrawing: boolean,
  txnLink?: string,
}

const PoolDrawer = (props: PoolDrawerProps) => {
  const { isOpen, onClose, onWithdraw, userWCJerseys, jerseyIdsToWithdraw, withdrawAmountPerJersey, isWithdrawing, txnLink } = props;
  const renderJerseysToWithdraw = jerseyIdsToWithdraw?.map((jerseyId) => {
    const currJersey = userWCJerseys.filter((jersey) => Number(jersey.id) === jerseyId)?.[0];
    if (!currJersey) return <div />;
    return (
      <Flex
        justifyContent="space-between"
        alignItems="center"
        key={jerseyId}
        mb="20px"
      >
        <HStack spacing="18px" display="flex" alignItems="center">
          <Image
            src={currJersey.image}
            style={{
              borderRadius: "10px",
              width: "90px",
            }}
            alt="jersey"
          />
          <Text fontSize="md" fontFamily="Gustavo">
            {currJersey.team} #{currJersey.number}
          </Text>
        </HStack>
        <Flex justifyContent="center" alignItems="center">
          <FaEthereum fontSize="20px" style={{ paddingRight: "8px" }} />
          <Text fontSize="md" fontFamily="Gustavo">
            {withdrawAmountPerJersey?.toFixed(3)}
          </Text>
        </Flex>
      </Flex>
    )
  })
  
  return (
    <Drawer
      isOpen={isOpen}
      placement='right'
      onClose={onClose}
      size="sm"
    >
      <DrawerOverlay />
      <DrawerContent bg={colors.brand.tertiary}>
        <DrawerCloseButton />
        <DrawerHeader
          fontFamily="Gustavo"
        >
          Withdraw jerseys
        </DrawerHeader>
        <DrawerBody>
          {renderJerseysToWithdraw}
        </DrawerBody>
        <DrawerFooter display="flex" flexDir="column">
          { txnLink ? (
            <Link href={txnLink} isExternal>
              <Text fontSize="md" _hover={{ textDecor: "underline" }} fontFamily="Gustavo" display='flex'>
                View on Etherscan
              </Text> 
            </Link>
          ) : (
            <Flex
              justifyContent="space-between"
              alignItems="center"
              w="100%"
            >
              <Text fontSize="md" fontFamily="Gustavo">
                Total Earnings
              </Text>
              <Flex justifyContent="center" alignItems="center">
                <FaEthereum fontSize="20px" style={{ paddingRight: "8px" }} />
                { withdrawAmountPerJersey && (
                  <Text fontSize="md" fontFamily="Gustavo">
                    {(withdrawAmountPerJersey * jerseyIdsToWithdraw.length)?.toFixed(3)}
                  </Text>
                )}
              </Flex>
            </Flex>
          )}
          <Button
            disabled={isWithdrawing || !jerseyIdsToWithdraw.length || txnLink !== ""}
            variant="solid"
            bgColor={colors.brand.primary}
            onClick={onWithdraw}
            w="100%"
            mt="30px"
            _hover={{ bgColor: colors.brand.primary }}
          >
            {isWithdrawing ? "Withdrawing..." : txnLink ? "Withdrawn" : "Withdraw"}
          </Button>
          
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default PoolDrawer;