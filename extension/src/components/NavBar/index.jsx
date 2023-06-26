import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Flex, FormControl, FormLabel, Modal, ModalOverlay, ModalContent, ModalBody, ModalFooter, Switch, Text } from '@chakra-ui/react';
import IconButton from '../Button/IconButton';
import CustomButton from '../Button';
import gridLogo from '../../assets/img/grid.svg';
import micLogo from '../../assets/img/mic.svg';
import avatarLogo from '../../assets/img/avatarIcon.svg';
import settingsLogo from '../../assets/img/settings.svg';
import grainTexture from '../../assets/img/grain.svg';
import mixpanel from 'mixpanel-browser';
import { colors } from '../../utils/theme';

const NavBar = ({ onSelect, enabled, setEnabled }) => {
  const [ready, setReady] = useState(false);
  const [isModelPopupOpen, setIsModelPopupOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  // Check cache to see if avatar is enabled
  useEffect(() => {
    chrome.storage.sync.get(['modelEnabled'], async (res) => {
      if (typeof res.modelEnabled !== "undefined") {
        setEnabled(res.modelEnabled);
      } else {
        setEnabled(false);
      }
      setReady(true);
    });
  }, [isAuthenticated]);

  // Track whether extension is enabled
  useEffect(() => {
    if (ready) {
      mixpanel.time_event("Avatar Usage");
      mixpanel.register("Avatar Usage", {"Enabled": enabled});
    };
  }, [enabled, ready]);

  // Handle enable or disable Hologram
  const onEnableToggleChange = (e) => {
    if (!e.target.checked) {
      setIsModelPopupOpen(true);
    } else {
      onEnableOrDisable(true);
    }
  }
  const onEnableOrDisable = (action) => {
    setEnabled(action);

    // Send update to content script to update Google Meet display
    chrome.tabs.query({}, tabs => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          source: "extension",
          type: "control",
          state: action ? "on" : "off",
        });
      });
    });
    setIsModelPopupOpen(false);
  }

  return (
    <Flex
      as="nav"
      position="absolute"
      bottom="-8"
      left="0"
      h="60px"
      marginBottom="0"
      alignItems="center"
      justify="space-between"
      w="100%"
      mb={8}
      p={8}
      pl={6}
      pr={6}
      bgColor={colors.brand.tertiary}
      bgImg={grainTexture}
      zIndex={5}
    >
      <IconButton
        icon={gridLogo}
        onClick={() => onSelect('avatars')}
      />
      <IconButton
        icon={avatarLogo}
        onClick={() => onSelect('interactions')}
      />
      <Box mx={1}>
        <FormControl display='flex' alignItems='center'>
          <FormLabel htmlFor='model-enable' mb='0'>
            { enabled ? "On" : "Off" }
          </FormLabel>
          { ready &&
            <Switch 
              defaultIsChecked={enabled}
              id='model-enable' 
              isChecked={enabled}
              onChange={onEnableToggleChange}
              colorScheme="colors"
            />
          }
        </FormControl>
      </Box>
      <IconButton
        icon={micLogo}
        onClick={() => onSelect('voice')}
      />
      <IconButton
        icon={settingsLogo}
        onClick={() => onSelect('settings')}
      />
      <Modal 
        isOpen={isModelPopupOpen} 
        onClose={() => setIsModelPopupOpen(false)} 
        isCentered 
        size="sm"
      >
        <ModalOverlay backdropFilter="blur(10px) hue-rotate(90deg)" />
        <ModalContent
          bg={colors.brand.tertiary}
          bgImage={grainTexture}
          p="20px"
        >
          <ModalBody w="100%" display="flex" flexDir="row">
            <Text fontSize="md">
              Are you sure you want to turn off Hologram? Your face will be revealed. 
            </Text>
          </ModalBody>
          <ModalFooter w="100%">
            <Box pr={1} w="100%">
              <CustomButton
                text="Cancel"
                variant="outline"
                color="transparent"
                // secondaryColor="white"
                onClick={() => setIsModelPopupOpen(false)}
              />
            </Box>
            <Box pl={1} w="100%">
              <CustomButton
                text="Proceed"
                variant="solid"
                color={colors.brand.primary}
                textColor="black"
                onClick={() => onEnableOrDisable(false)}
              />
            </Box>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default NavBar;