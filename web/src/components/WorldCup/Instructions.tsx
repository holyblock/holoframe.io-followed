import { 
  Box,
  Container,
  Divider,
  Flex,
  Heading,
  Text,
} from "@chakra-ui/react";
import { colors } from "../../styles/theme";

const MIRROR_LINK = "https://mirror.xyz/0x7949Ae9C02a8815Abb876f93B0B3fD8F076055bd/zy3zEvhhqc0onEeSm1vU94DaPfl-OEZ49lQehewyGfM";

const Instructions = () => {
  return (
    <Container
      display='flex'
      alignItems="center"
      justifyContent="center"
      flexDir="column"
      pb={["150px"]}
      maxW='container.lg'
    >
      <Divider mb="70px"/>
      <Heading
        as="h2"
        fontSize={["36px", "48px", "64px", "72px"]}
        mb="70px"
        textAlign="center"
      >
        How prize pool works
      </Heading>
      <Flex
        flexDir="column"
        alignItems="start"
        w="100%"
      >
        <Box mb="40px">
          <Heading fontFamily="Gustavo" mb="24px">
            1. Mint <span style={{ color: colors.brand.primary }}>away jerseys</span>
          </Heading>
          <Text>
            Each jersey will be from a random team out of the 32 World Cup teams and is automatically entered into the{' '}
            <span style={{ color: colors.brand.primary }}>buyback pool</span>.
          </Text>
        </Box>
        <Box mb="40px">
          <Heading fontFamily="Gustavo" mb="24px">
            2. Each round,{' '}
            <span style={{ color: colors.brand.primary }}>play</span>
            {' '}or{' '}
            <span style={{ color: colors.brand.primary }}>withdraw</span>
          </Heading>
          <Text>
            Each round, you can choose to{' '}
            <span style={{ color: colors.brand.primary }}>withdraw and claim your winnings</span>
            {' '}from the pool within a given period.{' '}
            <a href={MIRROR_LINK} target="_blank" rel="noreferrer">
              <span style={{ textDecoration: "underline" }}>Learn more here</span>
            </a>
          </Text>
        </Box>
        <Box>
          <Heading fontFamily="Gustavo" mb="24px">
            3. Advance & <span style={{ color: colors.brand.primary }}>win more</span>
          </Heading>
          <Text>
            <span style={{ color: colors.brand.primary }}>The more rounds</span>{' '}
            your team advances,{' '}
            <span style={{ color: colors.brand.primary }}>the more you can win</span>{' '}
            from the pool. If your team is eliminated, you can no longer claim.
          </Text>
        </Box>
      </Flex>
    </Container>
  );
};

export default Instructions;