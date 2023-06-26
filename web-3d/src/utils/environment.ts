import { NFTMetadata } from '@/types';

const S3_BASE_BACKGROUND = 'https://hologramxyz.s3.amazonaws.com/backgrounds/';
const BACKGROUND_FILENAMES = [
  'background1.png',
  'background2.jpg',
  'Background3.jpg',
  'background4.jpeg',
  'background5.jpg',
  'background6.jpeg',
  'background7.jpg',
  'background8.jpg',
  'background9.jpg',
  'background10.jpg',
  'background11.jpg',
];
const metadataGenerator = (index: number) => ({
  name: `Room-${index + 1}`,
  image: `${S3_BASE_BACKGROUND}${BACKGROUND_FILENAMES[index]}`,
  model_url: `${S3_BASE_BACKGROUND}${BACKGROUND_FILENAMES[index]}`,
  category: 'scene',
});

export const environment2Ds: NFTMetadata[] = BACKGROUND_FILENAMES.map(
  (_, index) => metadataGenerator(index)
);
