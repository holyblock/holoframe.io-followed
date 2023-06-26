import { Link } from 'react-router-dom';
import { colors } from 'renderer/styles/theme';
import {
  Box,
  Flex,
} from '@chakra-ui/react';
import IconButton from '../Button/IconButton';
import CreateButton from '../Button/CreateButton';
import gridLogo from '../../../../assets/img/grid.svg';
import studioLogo from '../../../../assets/img/studio.svg';
import grainTexture from '../../../../assets/img/grain.svg';


const NavBar = () => {
  return (
    <Flex
      as="nav"
      position="fixed"
      bottom="-8"
      left="0"
      h="60px"
      marginBottom="0"
      alignItems="center"
      justifyContent="center"
      w="100%"
      mb={8}
      p={8}
      pl={6}
      pr={6}
      bgColor={colors.brand.tertiary}
      bgImage={grainTexture}
      zIndex={99}
    >
      <Flex
        as="nav"
        marginBottom="0"
        alignItems="center"
        justify="center"
        w="100%"
        h="100%"
        maxW="md"
      >
        <Box mx={10}>
          <Link to="/">
            <IconButton icon={gridLogo} />
          </Link>
        </Box>
        
        <CreateButton />
        <Box mx={10}>
          <Link to="/studio">
            <IconButton icon={studioLogo} />
          </Link>
        </Box>
        {/* <Link to="/voice">
          <IconButton icon={micLogo} />
        </Link> */}
      </Flex>
    </Flex>
  );
};

export default NavBar;
