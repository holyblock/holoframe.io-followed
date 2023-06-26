import { Box, Container, Divider, Flex, Heading, Image, SimpleGrid, Text } from "@chakra-ui/react";
import { colors } from "../../styles/theme";

const MEDIA_URL_0 = "https://hologramxyz.s3.amazonaws.com/assets/mp4/wc-about.mp4";
const MEDIA_URL_1 = "https://hologramxyz.s3.amazonaws.com/assets/gifs/holo-wc-gif.gif";


const About = () => {
  return (
    <Container
      id="about"
      display='flex'
      alignItems="center"
      justifyContent="center"
      flexDir="column"
      mb={[10, 20, "180px"]}
      px={4}
      maxW='container.lg'
    >
      <Divider mb="70px"/>
      <Heading
        as="h2"
        fontSize={["36px", "48px", "64px"]}
        mb="140px"
        textAlign="left"
      >
        Introducing{' '}
        <span style={{ color: colors.brand.primary }}>Hologram World Cup Jerseys</span>
        , our genesis wearable drop.
      </Heading>
      <video autoPlay loop muted src={MEDIA_URL_0} style={{ borderRadius: "10px", width: "48em" }} />
      <SimpleGrid
        mt="180px"
        columns={[1, 2]}
        spacing={["40px", "40px", "80px"]}
      >
        <Box>
          <Heading fontFamily="Gustavo" mb="24px">
            Flex your team in the Metaverse.
          </Heading>
          <Text variant="voteParagraph">
            All jerseys are{' '}
            <span style={{ color: colors.brand.primary }}>limited edition, metaverse-ready</span>
            {' '}wearables. Flex them in Discord, VRChat, and {' '}
            <span style={{ color: colors.brand.primary }}>hundreds other</span>
            {' '}social & gaming applications.
          </Text>
        </Box>
        <Image style={{ borderRadius: "10px" }} src={MEDIA_URL_1} alt="create" />
        <Image style={{ borderRadius: "10px" }} src="/media/worldcup/about-2.png" alt="connect" />
        <Box display={['none', 'block']}>
          <Heading fontFamily="Gustavo" mb="24px">
            Compete to win an epic prize!
          </Heading>
          <Text variant="voteParagraph">
            “Away” jerseys are elligible for our{' '}
            <span style={{ color: colors.brand.primary }}>ETH prize pool</span>.
            The{' '}<span style={{ color: colors.brand.primary }}>more games</span>{' '}
            your teams win, the{' '}
            <span style={{ color: colors.brand.primary }}>more ETH</span>{' '}
            you can win!
          </Text>
        </Box>
      </SimpleGrid>
    </Container>
  );
};

export default About;