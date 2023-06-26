import React, { useEffect, useState } from 'react';
import { 
  Box,
  Collapse,
  Flex,
  Fade,
  IconButton,
  Heading,
} from '@chakra-ui/react';
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';

import AvatarPlacement from '../AvatarPlacement';
import ExpressionSelect from '../ExpressionSelect';
import TextureSelect from '../TextureSelect';
import { colors } from '../../utils/theme';
import UnsupportedDomainModal from './UnsupportedDomainModal';
import useDomainSupported from '../../hooks/useDomainSupported';

// Avatar interactions (zoom, placement, expressions, traits)
const Interactions = () => {
  const { domainSupported, done } = useDomainSupported();
  const [expressions, setExpressions] = useState([]); // expNames
  const [selectedExps, setSelectedExps] = useState([]);
  const [expsOpen, setExpsOpen] = useState(true);
  const [textureNames, setTextureNames] = useState([]);
  const [selectedTextureIndices, setSelectedTextureIndices] = useState([]);
  const [textureOpen, setTextureOpen] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize listener for getting all expressions
  useEffect(() => {
    if (done) setInitialized(true);
  }, [done]);

  useEffect(() => {
    if (domainSupported) {
      chrome.storage.sync.get([
        'expressions', 
        'selectedExpressions',
        'textures',
        'selectedTextures'
      ], async (res) => {
        if (res.expressions) {
          setExpressions(res.expressions);
        }
        if (res.selectedExpressions) {
          setSelectedExps(res.selectedExpressions);
        }
        if (res.textures) {
          setTextureNames(res.textures);
        }
        if (res.selectedTextures) {
          setSelectedTextureIndices(res.selectedTextures);
        }
        setInitialized(true);
      });
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === "all_expressions") {
          setExpressions(request.expressions);
        };
        sendResponse({ack: true});
      });
    }
  }, [domainSupported])

  // Notify content script of new expression selection
  useEffect(() => {
    if (initialized) {
      const message = {
        source: "extension",
        type: "expression",
        selected: JSON.stringify(selectedExps)
      }
      chrome.tabs.query({}, tabs => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, message);
        });
      });
    }
  }, [selectedExps.length]);

  return (
    <Fade in={initialized} style={{ height: '100%' }}>
      { domainSupported 
        ?
          <Flex
            flexDir='column'
            alignItems='center'
            w={320}
          >
            <Box pt={5}>
              <AvatarPlacement />
            </Box>
            { expressions.length > 0 &&
              <Box pt={2} w='100%'>
                <Flex justifyContent='space-between' alignItems='center'>
                  <Heading
                    size='xs'
                    pl={1}
                  >
                    Emotes
                  </Heading>
                  <IconButton
                    size='sm'
                    icon={expsOpen ? <ChevronUpIcon fontSize={20} /> : <ChevronDownIcon fontSize={20} />}
                    onClick={() => setExpsOpen(!expsOpen)}
                    variant='unstyled'
                    p={0}
                    _hover={{
                      color: colors.brand.primary
                    }}
                  />
                </Flex>
                <Collapse in={expsOpen} animateOpacity>
                  <ExpressionSelect 
                    expressions={expressions}
                    selectedExps={selectedExps}
                    setSelectedExps={setSelectedExps}
                  />
                </Collapse>
              </Box>
            }
            { textureNames.length > 1 &&
              <Box pt={2} pb={10} w='100%'>
                <Flex justifyContent='space-between' alignItems='center'>
                  <Heading
                    size='xs'
                    pl={1}
                  >
                    Traits
                  </Heading>
                  <IconButton
                    size='sm'
                    icon={textureOpen ? <ChevronUpIcon fontSize={20} /> : <ChevronDownIcon fontSize={20} />}
                    onClick={() => setTextureOpen(!textureOpen)}
                    variant='unstyled'
                    _hover={{
                      color: colors.brand.primary
                    }}
                  />
                </Flex>
                <Collapse in={textureOpen} animateOpacity>
                  <TextureSelect
                    textureNames={textureNames}
                    selectedTextureIndices={selectedTextureIndices}
                    setSelectedTextureIndices={setSelectedTextureIndices}
                  />
                </Collapse>
              </Box>
            }
          </Flex>
        :
          <UnsupportedDomainModal />
      }
    </Fade>
  );
};

export default Interactions;