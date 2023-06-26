import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useSwitchNetwork } from "wagmi";
import { colors } from "../../styles/theme";

import ConnectWallet from "../Modal/ConnectWallet";
import { useAuth } from "../../contexts/AuthContext";

const AppNavigationBar = () => {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { chainID, address, isConnected, logout } = useAuth();
  const { switchNetwork } = useSwitchNetwork();

  return (
    <Flex
      top={0}
      position="fixed"
      height="72px"
      width="100%"
      alignItems="center"
      px="18px"
      zIndex={10}
    >
      <Box _hover={{ cursor: "pointer" }}>
        <Link href="/" passHref>
          <Image src="/app-logo.svg" alt="hologram" height="33px" />
        </Link>
      </Box>
      <Flex ml="auto">
        <ButtonGroup
          alignItems="center"
          textAlign="center"
          size="sm"
          spacing={10}
          display="flex"
        >
          <Link href={"/studio"}>
            <Button
              color={
                router.pathname === "/studio" ? colors.brand.primary : "white"
              }
              variant="link"
            >
              Studio
            </Button>
          </Link>
          { !isConnected ? (
            <Button
              variant="solid"
              bgColor={colors.brand.primary}
              onClick={onOpen}
              w="150px"
            >
              Connect
            </Button>
          ) : (
            <Menu>
              <MenuButton
                w="150px"
                as={Button}
                variant="outline"
                ml="12px"
                color={colors.brand.primary}
                borderColor={colors.brand.primary}
                _hover={{
                  bgColor: colors.brand.primary,
                  color: "black",
                }}
                _active={{
                  bgColor: colors.brand.primary,
                  color: "black",
                }}
              >
                {`${address?.slice(0, 4)}...${address?.slice(38)}`}
              </MenuButton>
              <MenuList>
                {isConnected && chainID !== 1 && (
                  <MenuItem color="black" onClick={() => switchNetwork!(1)}>
                    Switch to Mainnet
                  </MenuItem>
                )}
                <MenuItem color="black" onClick={logout}>
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </ButtonGroup>
      </Flex>
      <ConnectWallet isOpen={isOpen} onClose={onClose} />
    </Flex>
  );
};

export default AppNavigationBar;
