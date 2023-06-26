import React from "react";
import logo from "../../assets/img/logo.svg";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import Button from "../../components/Button";

const welcomeMessage = "Become your digital self.";
const Welcome = ({ onConnect, onTryFeatured }) => {
  return (
    <Flex
      h="100%"
      w="100%"
      flexDir="column"
      justifyContent="space-between"
      alignItems="center"
    >
      <Box>
        <Heading as="h1" size="md">
          Hologram
        </Heading>
      </Box>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDir="column"
      >
        <img src={logo} alt="logo" width="100px" />
        <Text fontSize="md" align="center" pt="20px">
          {welcomeMessage}
        </Text>
      </Box>
      <Box w="320px">
        <Box mb={2}>
          <Button
            height="50px"
            color="transparent"
            variant="outline"
            text="Try Featured"
            onClick={onTryFeatured}
          />
        </Box>
        <Button
          height="50px"
          text="Connect Wallet"
          textColor="black"
          onClick={onConnect}
        />
      </Box>
    </Flex>
  );
};

export default Welcome;
