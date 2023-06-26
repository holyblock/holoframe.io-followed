import { NFTMetadata } from '@/types';

const countries = [
  'Argentina',
  'Australia',
  'Belgium',
  'Brazil',
  'Cameroon',
  'Canada',
  'Costa Rica',
  'Croatia',
  'Denmark',
  'Ecuador',
  'England',
  'France',
  'Germany',
  'Ghana',
  'Iran',
  'Japan',
  'Mexico',
  'Morocco',
  'Netherlands',
  'Poland',
  'Portugal',
  'Qatar',
  'Saudi Arabia',
  'Senegal',
  'Serbia',
  'South Korea',
  'Spain',
  'Switzerland',
  'Tunisia',
  'Uruguay',
  'United States',
  'Wales',
];

export const baycWorldcupClothing: NFTMetadata[] = countries.map(
  (currCountry) => {
    const country = currCountry.replace(' ', '');
    return {
      name: `${country} Home Jersey`,
      image: `https://hologramxyz.s3.amazonaws.com/nft/wc/images/home/${country}-69.gif`,
      model_url: `https://rolling-filters.s3.amazonaws.com/3d/WC+Jerseys/BAYC/jersey-home-${country.toLowerCase()}-ape.glb`,
      category: 'clothing',
    };
  }
);

export const penguinWorldcupClothing: NFTMetadata[] = countries.map(
  (currCountry) => {
    const country = currCountry.replace(' ', '');
    return {
      name: `${country} Home Jersey`,
      image: `https://hologramxyz.s3.amazonaws.com/nft/wc/images/home/${country}-69.gif`,
      model_url: `https://rolling-filters.s3.amazonaws.com/3d/WC+Jerseys/PPG/WC_${country}_Home_SkinWeight.glb`,
      category: 'clothing',
    };
  }
);

export const coolcatWorldcupClothing: NFTMetadata[] = countries.map(
  (currCountry) => {
    const country = currCountry.replace(' ', '');
    return {
      name: `${country} Home Jersey`,
      image: `https://hologramxyz.s3.amazonaws.com/nft/wc/images/home/${country}-69.gif`,
      model_url: `https://rolling-filters.s3.amazonaws.com/3d/WC+Jerseys/COOL/WC_${country}_Home_SkinWeight.glb`,
      category: 'clothing',
    }
  }
)
