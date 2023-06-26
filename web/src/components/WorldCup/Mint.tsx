import { useState } from "react";
import {
  Box,
  ButtonGroup,
  Button,
  Container,
  Divider,
  Image,
  Heading,
  Text,
  ListItem,
  UnorderedList,
  useDisclosure,
  Fade
} from "@chakra-ui/react";
import MintHome from "./MintHome";
import MintAway from "./MintAway";
import ConnectWallet from "../Modal/ConnectWallet";
import { colors } from "../../styles/theme";
import { useAuth } from "../../contexts/AuthContext";
import { holoWCHomeContract } from "../../contexts/WCHomeContext";
import { holoWCAwayContract } from "../../contexts/WCAwayContext";

const SEASON_PASS_TWEET_URL = "https://twitter.com/HologramLabs/status/1583183187177459712";

const Mint = () => {
  const { isConnected, chainID, address } = useAuth();
  const [selected, setSelected] = useState("away"); // home or away
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Container
      display='flex'
      alignItems="center"
      justifyContent="center"
      flexDir="column"
      mb={[10, 20, "150px"]}
      px={4}
      maxW='container.lg'
    >
      <Divider mb="70px"/>
      <Heading
        as="h2"
        fontSize={["36px", "48px", "64px", "72px"]}
        mb="45px"
        textAlign="center"
      >
        Choose your Jerseys
      </Heading>
      <ButtonGroup
        alignItems="center"
        textAlign="center"
        size="sm"
        spacing="100px"
        display="flex"
      >
        <Button
          variant="link"
          fontFamily="Gustavo"
          fontSize={["36px", null, "36px"]}
          color={selected === "home" ? colors.brand.primary : "white"}
          onClick={() => setSelected("home")}
          textTransform="capitalize"
          _focus={{ boxShadow: "none" }}
        >
          Home
        </Button>
        <Button
          variant="link"
          fontFamily="Gustavo"
          fontSize={["36px", null, "36px"]}
          color={selected === "away" ? colors.brand.primary : "white"}
          onClick={() => setSelected("away")}
          textTransform="capitalize"
          _focus={{ boxShadow: "none" }}
        >
          Away
        </Button>
      </ButtonGroup>
      { selected === "home" &&
        <Fade in={selected === "home"}>
          <video
            autoPlay
            loop
            muted
            style={{
              borderRadius: "10px",
              marginTop: "45px",
              marginBottom: "45px",
              width: "30em",
              height: "30em"
            }}
            width="container.sm"
            src={holoWCHomeContract.mp4}
          />
        </Fade>
      }
      { selected === "away" &&
        <Fade in={selected === "away"}>
          <video
            autoPlay
            loop
            muted
            style={{
              borderRadius: "10px",
              marginTop: "45px",
              marginBottom: "45px",
              width: "30em",
              height: "30em"
            }}
            width="container.sm"
            src={holoWCAwayContract.mp4}
          />
        </Fade>
      }
      { selected === "home" ? (
        <UnorderedList fontSize="18px">
          <ListItem>Limited edition collectibles you can wear on your holograms.</ListItem>
          <ListItem>Flex them on Zoom calls, Twitch streams, or games like VRChat!</ListItem>
          <ListItem>
            Chance to be allowlisted for{' '}
            <a href={SEASON_PASS_TWEET_URL} target="_blank" rel="noreferrer">
              <span style={{ textDecoration: "underline" }}>Hologram Season Passes</span>.
            </a>
          </ListItem>
        </UnorderedList>
      ) : (
        <UnorderedList fontSize="18px">
          <Text>Same as home jerseys, PLUS</Text>
          <ListItem>Enroll into the prize pool.</ListItem>
          <ListItem>Collect your top teams, win when they win.</ListItem>
        </UnorderedList>
      )}
      { isConnected && address && chainID === holoWCHomeContract.chainId ? (
        <>
          { selected === "home" ? <MintHome address={address} chainID={chainID} /> : <MintAway address={address} chainID={chainID} /> } 
        </>
      ) : (
        <Box mt="45px">
          <Button
            variant="solid"
            bgColor={colors.brand.primary}
            onClick={onOpen}
            w="150px"
          >
            Connect
          </Button>
        </Box>
      )}
      <ConnectWallet isOpen={isOpen} onClose={onClose} selectedChainId={holoWCHomeContract.chainId} />
    </Container>
  );
};

export default Mint;