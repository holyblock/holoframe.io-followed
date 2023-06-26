import { Button, Flex } from '@chakra-ui/react';
import { Stage } from 'konva/lib/Stage';
import React, { useEffect, useRef, useState } from 'react';
import { BsPlayFill, BsPauseFill, BsXCircle } from 'react-icons/bs';
import Peaks, { PeaksInstance, Segment } from 'peaks.js';

import './index.css';
import { colors } from 'renderer/styles/theme';
import { useNFT } from 'renderer/contexts/NFTContext';
import { useRecording } from 'renderer/contexts/RecordingContext';

export function WaveformView({
  audioElement,
  onRemove,
}: {
  audioElement: HTMLAudioElement;
  onRemove: () => void;
}) {
  const { scene } = useNFT();
  const { recording } = useRecording();
  const overviewWaveformRef = useRef<HTMLDivElement>();
  const peaks = useRef<PeaksInstance>();
  const segment = useRef<Segment>();
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => setIsPlaying(!isPlaying);

  let isDragging = false;
  let mouseDownTime;

  function handleMouseDown(event: any) {
    isDragging = true;

    mouseDownTime = peaks.current.views
      .getView('overview')
      .pixelsToTime(event.evt.layerX);

    segment.current.update({
      startTime: mouseDownTime,
      endTime: mouseDownTime,
    });
  }

  function handleMouseMove(event: any) {
    if (isDragging) {
      const mouseTime = peaks.current.views
        .getView('overview')
        .pixelsToTime(event.evt.layerX);

      if (mouseTime >= mouseDownTime) {
        segment.current.update({ endTime: mouseTime });
      } else {
        segment.current.update({
          startTime: mouseTime,
          endTime: mouseDownTime,
        });
      }
    }
  }

  function handleMouseUp(event: any) {
    isDragging = false;

    peaks.current.player.seek(segment.current.startTime);
  }

  useEffect(() => {
    const audioContext = scene.current.getAudioContext();
    const options = {
      containers: { overview: overviewWaveformRef.current },
      mediaElement: audioElement,
      webAudio: { audioContext },
      keyboard: true,
      logger: console.error.bind(console),
      waveformColor: 'rgba(0, 225, 128, 1)',
      playheadColor: 'rgba(255, 0, 0, 1)',
    };
    if (peaks.current) {
      peaks.current.destroy();
      peaks.current = undefined;
    }
    Peaks.init(options, (err, p) => {
      peaks.current = p;
      scene.current.addPeaksInstance(p);
      const overview = p.views.getView('overview') as any;

      p.segments.add({ startTime: 0, endTime: 0, id: 'trim-segment' });
      segment.current = p.segments.getSegment('trim-segment');

      const _stage = overview._stage as Stage;

      _stage.on('mousedown', handleMouseDown);
      _stage.on('mousemove', handleMouseMove);
      _stage.on('mouseup', handleMouseUp);
    });
  }, []);

  useEffect(() => {
    setIsPlaying(recording);
  }, [recording]);

  return (
    <Flex w="100%" alignItems="center">
      <div className="overview-container" ref={overviewWaveformRef} />
      <Button
        color="black"
        backgroundColor={colors.brand.primary}
        onClick={() => {
          const audioContext = scene.current.getAudioContext();
          const sources = scene.current.getMp3SourceNodeItems();
          sources.forEach((source) => source.connect(audioContext.destination));
          const { player } = peaks.current;
          const { startTime, endTime } = segment.current;
          if (isPlaying) {
            player.pause();
          } else if (endTime - startTime === 0) {
            player.play();
          } else {
            player.playSegment(segment.current, true);
          }
          togglePlay();
        }}
        ml={3}
      >
        {isPlaying ? (
          <BsPauseFill fontSize={24} />
        ) : (
          <BsPlayFill fontSize={24} />
        )}
      </Button>
      <Button
        color="black"
        backgroundColor={colors.brand.primary}
        ml={3}
        onClick={onRemove}
      >
        <BsXCircle fontSize={24} />
      </Button>
    </Flex>
  );
}
