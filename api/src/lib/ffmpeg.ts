import { createFFmpeg } from '@ffmpeg/ffmpeg';
import PQueue from 'p-queue';

const ffmpegInstance = createFFmpeg({ log: true });
let ffmpegLoadingPromise: Promise<void> | undefined = ffmpegInstance.load();

const ffmpegQueue = new PQueue({ concurrency: 1 });

async function getFFmpeg() {
  if (ffmpegLoadingPromise) {
    await ffmpegLoadingPromise;
    ffmpegLoadingPromise = undefined;
  }

  return ffmpegInstance;
}

export { ffmpegQueue, getFFmpeg };
