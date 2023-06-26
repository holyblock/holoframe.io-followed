import React from 'react';
import { 
  Flex,
  Tag
} from '@chakra-ui/react';
import { colors } from '../utils/theme';

// Controls which textures to include / exclude
const TextureSelect = (props) => {
  const {
    textureNames,
    selectedTextureIndices,
    setSelectedTextureIndices
  } = props;

  const onSelectTexture = (textureIndex) => {
    let newTextureIndices = [];
    if (selectedTextureIndices.includes(textureIndex)) {
      newTextureIndices = selectedTextureIndices.filter(exp => exp !== textureIndex);
    } else {
      newTextureIndices = selectedTextureIndices.concat(textureIndex);
    }
    setSelectedTextureIndices(newTextureIndices);
    
    const message = {
      source: "extension",
      type: "texture",
      selected: JSON.stringify(newTextureIndices)
    }
    chrome.tabs.query({}, tabs => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, message);
      });
    });
  };

  const renderTextures = textureNames?.map((textureName, i) => {
    const isSelected = selectedTextureIndices.includes(i);
    return (
      <Tag
        key={textureName}
        m={1}
        onClick={() => onSelectTexture(i)}
        bgColor={isSelected ? colors.brand.primary : 'transparent'}
        color={isSelected ? 'black' : 'white'}
        px={2}
        py={1}
        outline='1px solid white'
        _hover={{ 
          cursor: 'pointer',
          bgColor: colors.brand.primary,
          color: 'black'
        }}
      >
        {textureName}
      </Tag>
    )
  });

  return (
    <Flex flexDir='row' alignItems='left' flexWrap='wrap'>
      { selectedTextureIndices && renderTextures }
    </Flex>
  );
};

export default TextureSelect;