import { Link } from 'react-router-dom';
import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import Button from 'renderer/components/Button';
import logo from '../../../../assets/img/logo.svg';

const welcomeMessage = 'Become your main character.';
const Welcome = () => {
  return (
    <Flex
      h="100%"
      w="100%"
      flexDir="column"
      justifyContent="space-between"
      alignItems="center"
    >
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
      <Box h="40px" w="320px">
        <Link to="/login">
          <Button
            secondaryColor="#5D5FEF"
            height="50px"
            text="Connect Wallet"
          />
        </Link>
      </Box>
    </Flex>
  );
};

export default Welcome;
