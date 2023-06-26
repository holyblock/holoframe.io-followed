import { NFTMetadata } from '@/types';
import useStore, { WardrobeMode } from '@/utils/store';
import {
  baycWorldcupClothing,
  coolcatWorldcupClothing,
  penguinWorldcupClothing,
} from '@/utils/worldcup';
import { useState, useEffect } from 'react';
import Avatars from './Avatars';
import Collection from './Collection';
import Wardrobe from './Wardrobe';

const Closet = () => {
  const [selectedAccessories, setSelectedAccessories] =
    useState<NFTMetadata[]>(baycWorldcupClothing);

  const selectedModelData: any = useStore((state) => state.selectedModelData);
  const setSelectedClothingData: any = useStore(
    (state) => state.setSelectedClothingData
  );

  // TEMP helper for worldcup
  const setClothingByCollection = () => {
    switch (selectedModelData.name) {
      case 'BAYC':
        setSelectedAccessories(baycWorldcupClothing);
        return baycWorldcupClothing;
      case 'Cool Cats':
        setSelectedAccessories(coolcatWorldcupClothing);
        return coolcatWorldcupClothing;
      case 'Pudgy Penguins':
        setSelectedAccessories(penguinWorldcupClothing);
        return penguinWorldcupClothing;
      default:
        setSelectedAccessories(baycWorldcupClothing);
        return baycWorldcupClothing;
    }
  };

  // TEMP: Render default clothing based on selected avatar
  useEffect(() => {
    const targetClothing = setClothingByCollection();
    setSelectedClothingData([targetClothing[0]]);
  }, [selectedModelData]);

  return (
    <div className="flex justify-between h-full px-12 pb-12 pt-[105px]">
      <div className="left-panel shrink-0 aspect-[1/1.8] min-w-[340px] max-lg:transform-none">
        <div className="relative h-full">
          <Avatars />
          <Wardrobe
            selectedAccessories={selectedAccessories}
            setSelectedAccessories={setSelectedAccessories}
          />
        </div>
      </div>
      <div className="flex flex-col right-panel max-lg:hidden shrink-0 aspect-[1/2.25] min-w-[270px]">
        <Collection />
      </div>
    </div>
  );
};

export default Closet;
