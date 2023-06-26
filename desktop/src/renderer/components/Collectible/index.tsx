import React, { useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Image,
  Fade,
  Modal,
  ModalCloseButton,
  ModalOverlay,
  ModalContent,
  Tag,
  Text,
  AspectRatio,
} from '@chakra-ui/react';
import { colors } from 'renderer/styles/theme';
import Button from '../Button';
import grainTexture from '../../../../assets/img/grain.svg';

interface CollectibleProps {
  name: string;
  isHologram: boolean;
  description: string;
  imageURL: string;
  isOpen: boolean;
  actionText: string[];
  actions: (() => void)[];
  onBack: () => void;
}

const Collectible = (props: CollectibleProps) => {
  const {
    name,
    isHologram,
    description,
    imageURL,
    isOpen,
    actionText,
    actions,
    onBack,
  } = props;
  const [showInfo, setShowInfo] = useState(false);

  return (
    <Modal isOpen={isOpen} onClose={onBack} isCentered size="xl">
      <ModalOverlay />
      <ModalContent
        mx={1}
        my={4}
        p={10}
        bgImage={grainTexture}
        bgColor={colors.brand.tertiary}
      >
        <ModalCloseButton
          _hover={{
            color: colors.brand.primary,
          }}
          onClick={() => onBack()}
        />
        <Box
          position="relative"
          onMouseOver={() => setShowInfo(true)}
          onMouseOut={() => setShowInfo(false)}
        >
          {imageURL.endsWith('.mp4') ? (
            <AspectRatio maxW="100%" ratio={1} mb={5}>
              <video
                src={imageURL}
                muted
                autoPlay
                loop
                preload="metadata"
                style={{ opacity: showInfo ? 0.3 : 1 }}
              />
            </AspectRatio>
          ) : (
            <Image
              src={imageURL}
              loading="lazy"
              w="100%"
              alt="nft"
              mb={5}
              opacity={showInfo ? 0.3 : 1}
              _hover={{
                WebkitTransition: 'opacity 0.1s',
                transition: 'opacity 0.1s',
              }}
            />
          )}
          <Fade in={showInfo}>
            <Box position="absolute" color="white" mx={3} my={2} bottom={0}>
              <Box
                css={{
                  '&::-webkit-scrollbar': {
                    display: 'none',
                  },
                }}
                overflowY="scroll"
                maxH="300px"
                maxW="300px"
              >
                <Tag
                  mt={8}
                  mb={3}
                  h={1}
                  size="sm"
                  variant="solid"
                  bgColor="white"
                >
                  <Text color="black">{isHologram ? 'Hologram' : 'NFT'}</Text>
                </Tag>
                <Heading size="sm" mb={3}>
                  {name}{' '}
                </Heading>
                <Text fontSize="sm" mb={5}>
                  {description}
                </Text>
              </Box>
            </Box>
          </Fade>
        </Box>
        <Flex flexDir="row" gap={2}>
          <Button
            variant="outline"
            // color={colors.brand.primary}
            color="transparent"
            height="50px"
            text={actionText[0]}
            textColor="white"
            onClick={actions[0]}
          />
          <Button
            color={colors.brand.primary}
            height="50px"
            text={actionText[1]}
            textColor="black"
            onClick={actions[1]}
          />
        </Flex>
      </ModalContent>
    </Modal>
  );
};

export default Collectible;
