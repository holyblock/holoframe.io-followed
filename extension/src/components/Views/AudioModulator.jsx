import React, { useEffect, useState } from 'react';
import * as Tone from 'tone';
import CircularSlider from '@fseehawer/react-circular-slider';
import { Box, Flex } from '@chakra-ui/react';
import Button from '../Button';
import PreviewAudio from '../../assets/audio/preview-audio.mp3';
import PlayIcon from '../../assets/img/play.svg';
import mixpanel from 'mixpanel-browser';

import { getChromeCache } from '../../utils/chromeAPIHelper';
import { colors } from '../../utils/theme';

const previewAudioPlayer = new Tone.Player(PreviewAudio);

const AudioModulator = () => {
  const [initialPitchIndex, setInitialPitchIndex] = useState();
  const [unparsedPitch, setUnparsedPitch] = useState();
  const [ready, setReady] = useState(false);
  const defaultPitches = [
    "+1", "+2", "+3", "+4", "+5", "+6", "+7", "+8", "+9", "+10", 
    "+11", "+12", "-12", "-11", "-10", "-9", "-8", "-7", "-6", "-5", "-4",
    "-3", "-2", "-1", "0",
  ];

  // Helper to rid of '+' in positive pitches
  const parsePitchValue = (pitch) => {
    let pitchValue = pitch;
    if (pitch?.includes('+')) {
      pitchValue = pitch.substring(1);
    }
    return pitchValue;
  }

  // Get cached pitch index and value
  useEffect(() => {
    (async () => {
      const cachedPitch = await getChromeCache('unparsedModelPitch');
      let pitchIndex = defaultPitches.length - 1;
      let pitchValue = '0';
      if (cachedPitch) {
        setUnparsedPitch(cachedPitch);
        pitchIndex = defaultPitches.indexOf(cachedPitch);
        pitchValue = parsePitchValue(defaultPitches[pitchIndex]);
      }
      setInitialPitchIndex(pitchIndex);
      updatePitch(pitchValue);
      setReady(true);
    })();
  }, []);

  const updatePitch = (newPitch, cache) => {
    setUnparsedPitch(newPitch);

    const pitchValue = parsePitchValue(newPitch);
    chrome.tabs.query({}, tabs => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          source: "extension",
          type: "pitch",
          pitchLevel: pitchValue,
          cache: cache
        });
      });
    });

    const pitchShift = new Tone.PitchShift(pitchValue).toDestination();
    previewAudioPlayer.disconnect();
    previewAudioPlayer.connect(pitchShift);

   
    if (cache) {
      // Cache pitch display
      chrome.storage.sync.set({ unparsedModelPitch: newPitch });

       // Track voice analytics
      mixpanel.time_event("Voice Selection");
      mixpanel.track("Voice Selection", {
        "Pitch": pitchValue
      });
    }
  };

  const onPreviewClicked = () => {
    previewAudioPlayer.start();
    mixpanel.track("Voice Preview Clicked");
  };

  return (
    <Flex h="100%" pl="5px" pr="5px" justifyContent="center" alignItems="center">
      { ready &&
        <div
          style={{
            zIndex: 0
          }}
          onMouseUp={() => {
            updatePitch(unparsedPitch, true);
          }}
        >
          <CircularSlider
            label="Pitch"
            labelColor="white"
            progressSize={0}
            dataIndex={initialPitchIndex}
            trackSize={12}
            knobSize={34}
            knobColor={colors.brand.primary}
            data={defaultPitches}
            onChange={async (data) => { 
              if (data) {
                updatePitch(data);
              }
            }}
          />
          <Box 
            position="absolute" 
            ml="auto"
            mr="auto"
            height="20px"
            width="100px"
            top="420px"
            left={0}
            right={0}
            textAlign="center"
          >
            <Button 
              color={colors.brand.primary}
              textColor="black"
              size="sm"
              variant="outline"
              text={'Preview'}
              onClick={onPreviewClicked}
            />
          </Box>
        </div>
      }
    </Flex>
  );
};

export default AudioModulator;