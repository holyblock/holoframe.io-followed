import { useEffect, useState } from 'react';
import {
  Box,
  ModalBody,
  ModalFooter,
  Heading,
  Flex,
  Tooltip,
} from '@chakra-ui/react';
import Modal from 'renderer/components/Modal';
import { useNFT } from 'renderer/contexts/NFTContext';
import { HexColorInput, HexColorPicker } from 'react-colorful';
import { colors } from 'renderer/styles/theme';
import Button from 'renderer/components/Button';
import localforage from 'localforage';
import { InfoOutlineIcon } from '@chakra-ui/icons';

interface ColorPickerProps {
  isOpen: boolean;
  onClose: () => void;
}

const GREEN_SCREEN_HEX = '#04F404';

const ColorPicker = (props: ColorPickerProps) => {
  const { isOpen, onClose } = props;
  const [color, setColor] = useState(''); // color hex code
  const { setBackgroundColor } = useNFT();

  useEffect(() => {
    (async () => {
      const cachedColor = await localforage.getItem('bgColor');
      if (cachedColor) {
        setColor(cachedColor as string);
      }
    })();
  }, []);

  const updateColor = (newColor) => {
    setColor(newColor);
    setBackgroundColor(newColor);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      header={
        <Heading mb={2} textAlign="center" size="md">
          Set Background Color
        </Heading>
      }
    >
      <ModalBody>
        <Flex
          flexDir="column"
          justifyContent="center"
          alignItems="center"
          px="5px"
        >
          <HexColorPicker
            color={color}
            onChange={(newColor) => {
              updateColor(newColor);
            }}
            onMouseUp={() => {
              updateColor(color);
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
      </ModalBody>
      <ModalFooter display="flex" justifyContent="center" alignItems="center">
        <Tooltip
          label={`Sets color to ${GREEN_SCREEN_HEX}, used for green screen effect in Twitch Studio or chroma key in OBS`}
          mr={10}
          w="100%"
        >
          <InfoOutlineIcon />
        </Tooltip>
        <Button
          text="Set Green Screen"
          variant="ghost"
          secondaryColor={colors.brand.primary}
          height="50px"
          onClick={() => updateColor(GREEN_SCREEN_HEX)}
        />
      </ModalFooter>
    </Modal>
  );
};

export default ColorPicker;
