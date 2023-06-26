import {
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Link,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { HamburgerIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { BsCameraVideoFill } from 'react-icons/bs';
import { MdOndemandVideo, MdSettings } from 'react-icons/md';

const MainMenu = () => {
  return (
    <Menu>
      <MenuButton
        zIndex={99}
        as={IconButton}
        aria-label="Options"
        icon={<HamburgerIcon />}
        variant="ghost"
        position="fixed"
        _hover={{ opacity: 0.6 }}
        left={2}
        top={2}
      />
      <MenuList>
        <Link href="https://hologram.xyz" isExternal>
          <MenuItem color="black" icon={<ExternalLinkIcon />}>
            About Hologram
          </MenuItem>
        </Link>
        <Link
          href="https://docs.hologram.xyz/guides/desktop-app-guide"
          isExternal
        >
          <MenuItem color="black" icon={<MdOndemandVideo />}>
            Quickstart Guide
          </MenuItem>
        </Link>
        <Link
          href="https://docs.hologram.xyz/guides/streaming-guide"
          isExternal
        >
          <MenuItem color="black" icon={<BsCameraVideoFill />}>
            Streaming Guide
          </MenuItem>
        </Link>
        <RouterLink to="/settings">
          <MenuItem color="black" icon={<MdSettings />}>
            Settings
          </MenuItem>
        </RouterLink>
      </MenuList>
    </Menu>
  );
};

export default MainMenu;
