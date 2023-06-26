import React, { useEffect, useState } from 'react';
import {
  Tooltip,
  Flex,
  Text,
  Heading,
  Slider,
  SliderTrack,
  SliderThumb,
  SliderFilledTrack,
  Switch,
  FormControl,
} from '@chakra-ui/react';
import { HexColorInput, HexColorPicker } from 'react-colorful';

const Settings = () => {
  const [lipsyncSensitivity, setLipsyncSensitivity] = useState(0);
  const [color, setColor] = useState(''); // color hex code
  const [stabilize, setStabilize] = useState(false);

  // Check pre-existing cache
  useEffect(() => {
    chrome.storage.sync.get(
      ['lipsyncSensitivity', 'backgroundType', 'modelBackground', 'stabilize'],
      async (res) => {
        if (res.lipsyncSensitivity !== undefined) {
          setLipsyncSensitivity(res.lipsyncSensitivity);
        }
        if (res.backgroundType === 'color') {
          updateColor(res.modelBackground);
        }
        if (res.stabilize !== undefined) {
          setStabilize(res.stabilize);
        }
      }
    );
  }, []);

  // Update content script
  useEffect(() => {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'lipsync_sensitivity',
          value: lipsyncSensitivity,
        });
      });
    });
  }, [lipsyncSensitivity]);

  // Update content script of stability
  useEffect(() => {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'stabilize',
          value: stabilize,
        });
      });
    });
  }, [stabilize]);

  const updateColor = (newColor, cache) => {
    setColor(newColor);
    const message = {
      source: 'extension',
      type: 'background_color',
      color: newColor,
      cache: cache,
    };
    // Notify content script of new background color
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, message);
      });
    });
  };

  return (
    <Flex
      flexDir="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      mx={3}
    >
      <Heading mt={5} fontSize="sm">
        Sensitivity
      </Heading>
      <Flex w="100%" flexDir="row" justifyContent="space-between" mt={3}>
        <Tooltip label="Move mouth according to audio input">
          <Text mr={3} fontSize="sm" fontWeight="bold">
            Lip-Sync
          </Text>
        </Tooltip>
        <Slider
          w="200px"
          colorScheme="purple"
          value={lipsyncSensitivity}
          defaultValue={lipsyncSensitivity}
          onChange={(v) => {
            setLipsyncSensitivity(v);
          }}
          onChangeEnd={(v) => {
            setLipsyncSensitivity(v);
          }}
          min={0}
          max={5}
          mr={3}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
        <Text>{lipsyncSensitivity}</Text>
      </Flex>
      <Flex mt={5} w="100%" flexDir="row" justifyContent="space-between">
        <Tooltip label="Stabilize avatar's body movement">
          <Text fontSize="sm" fontWeight="bold">Stabilize</Text>
        </Tooltip>
        <FormControl display="flex" alignItems="center" justifyContent="right">
          <Switch
            defaultChecked={stabilize}
            id="hologram-enable"
            isChecked={stabilize}
            onChange={() => setStabilize(!stabilize)}
            colorScheme="colors"
            mr={3}
          />
          <Text>{stabilize ? 'On' : 'Off'}</Text>
        </FormControl>
      </Flex>
      <Heading mt={5} fontSize="sm">
        Background Color
      </Heading>
      <Flex
        flexDir="column"
        justifyContent="center"
        alignItems="center"
        px="5px"
        w="100%"
        h="100%"
      >
        <HexColorPicker
          color={color}
          onChange={(newColor) => {
            updateColor(newColor);
          }}
          onMouseUp={() => {
            updateColor(color, true);
          }}
          style={{ margin: '12px 12px' }}
        />
        <HexColorInput
          color={color}
          onChange={(newColor) => {
            updateColor(newColor);
          }}
          placeholder="Insert hex here"
          style={{
            borderRadius: '5px',
            padding: '3px',
            textAlign: 'center',
            display: 'block',
            boxSizing: 'border-box',
            border: '1px solid #ddd',
            color: 'black',
            width: '200px',
          }}
        />
      </Flex>
    </Flex>
  );
};

export default Settings;
