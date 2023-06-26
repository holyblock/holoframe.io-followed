import React, { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Image,
  Fade,
  Tag,
  Text,
  AspectRatio,
} from "@chakra-ui/react";
import Button from "../Button";

const Collectible = ({
  name,
  category,
  description,
  imageURL,
  onClick,
  onBack,
}) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <Box mx={1} my={4}>
      <Box
        zIndex={20}
        position="relative"
        onMouseOver={() => setShowInfo(true)}
        onMouseOut={() => setShowInfo(false)}
      >
        {imageURL.endsWith(".mp4") ? (
          <AspectRatio maxW="100%" ratio={1} mb={5}>
            <video src={imageURL} muted autoPlay loop preload="metadata" />
          </AspectRatio>
        ) : (
          <Image src={imageURL} loading="lazy" w="100%" alt="nft" mb={5} />
        )}
        <Box
          top={0}
          left={0}
          bottom={0}
          right={0}
          position="absolute"
          backgroundColor={showInfo ? "rgba(0,0,0,0.3)" : "transparent"}
        >
          <Fade in={showInfo}>
            <Box position="absolute" color="white" mx={3} my={2} bottom={0}>
              <Box
                css={{
                  "&::-webkit-scrollbar": {
                    display: "none",
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
                  color="black"
                  bgColor="white"
                >
                  <Text fontFamily="inter">{category}</Text>
                </Tag>
                <Heading size="sm" mb={3}>
                  {name}{" "}
                </Heading>
                <Text fontSize="sm" mb={5}>
                  {description}
                </Text>
              </Box>
            </Box>
          </Fade>
        </Box>
      </Box>
      <Flex flexDir="row" gap={2}>
        <Button
          text="Back"
          variant="outline"
          height="50px"
          color="transparent"
          onClick={onBack}
        />
        <Button height="50px" text="Use" textColor="black" onClick={onClick} />
      </Flex>
    </Box>
  );
};

export default Collectible;
