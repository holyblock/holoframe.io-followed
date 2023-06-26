import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import animationSequence from './animationSequence.json';
import { HologramStudio } from '../.';
const EventEmitter = require('eventemitter3');

// Automatically starts character animation recording and downloading
const RECORDING_DURATION_MS = 7500;
const defaultBackgroundPrefix = 'https://rolling-filters.s3.amazonaws.com/live2d/anata-backgrounds/';
const enableDownload = true;

const assets: any[] = [];
for (let i = 0; i < 20; i ++) {
  assets.push(
    {
      'name': 'Anata',
      'project': 'anata',
      'description': 'Anata NFT, powered by hologram.xyz',
      'type': 'live2d',
      'animation_url': '',
      'model_url': 'https://rolling-filters.s3.amazonaws.com/live2d/anata-male/' + i + '.zip',
      'image': 'https://rolling-filters.s3.amazonaws.com/images/anataShoujo.png'
    }
  )
}

const link = document.createElement("a");

const recordCanvas = async (filename: string) => {
  let recording = false;
  const bus = new EventEmitter();
  const canvas = document.getElementById('output-canvas');

   // Initialize canvas recorder
   const stream = (canvas as any).captureStream(30);
   const mimeType = 'video/webm; codecs=vp9';
   const canvasRecorder = new MediaRecorder(stream, {
     mimeType: mimeType
   });
   let chunks: any = [];
   canvasRecorder.ondataavailable = (event: any) => {
     event.data.size && chunks.push(event.data as any);
   };
   canvasRecorder.onstop = () => {
     if (chunks.length) {
       const blob = new Blob(chunks);
       const dataURL = URL.createObjectURL(blob);
       link.download = filename;
       link.href = dataURL;
 
       // Download file
       if (enableDownload) {
         const event = new MouseEvent("click");
         link.dispatchEvent(event);
       }
       URL.revokeObjectURL(dataURL);
     }
   };

  // Callback function to execute when mutations are observed
  const callback = (mutationsList, observer) => {
    // Use traditional 'for loops' for IE 11
    for (const mutation of mutationsList) {
      if (mutation.type === 'attributes') {
        if (mutation.attributeName === 'id') {
          const canvasID = canvas?.getAttribute('id');
          if (canvasID === 'output-canvas' && !recording) {
            // Start recording
            canvasRecorder.start();
            recording = true;
            bus.emit('unlocked'); // Emit event for setTimeout loop to start
          }
        }
      }
    }
  };

  // Create an observer instance linked to the callback function
  const config = { attributes: true, childList: false, subtree: false };
  const observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(canvas!, config);

  // Block function until recording has started
  await new Promise(resolve => bus.once('unlocked', resolve));
  
  return new Promise(resolve => setTimeout(() => {
    canvasRecorder.stop();
    observer.disconnect();
    resolve(true);
  }, RECORDING_DURATION_MS));
};

(async () => {
  let i: number = 0;
  const lastIndex = localStorage.getItem('lastIndex');
  if (lastIndex) {
    i = +lastIndex;
  }
  if (i === assets.length) {
    localStorage.removeItem('lastIndex');
    return;
  }
  const randomBackground = 1 + Math.floor(Math.random() * 6);
  const backgroundURL = defaultBackgroundPrefix + randomBackground + '.jpg'
  // refresh DOM at each iteration, remove localStorage
  ReactDOM.render(
    <HologramStudio
      apiKey={'iuw27ggiwnyvfs6flhcctw65ef2e5cdhmaab223xu6fyc6xw5obh3ei'}
      nftMetadataList={assets}
      selectedAvatarIndex={i}
      trackingMode='animation'
      animationSequence={animationSequence}
      defaultBackgroundURL={backgroundURL}
    />,
    document.getElementById('root')
  );
  await recordCanvas(`anata-${i}.webm`);
  i++;
  localStorage.setItem('lastIndex', `${i}`);
  window.location.reload();
})();
