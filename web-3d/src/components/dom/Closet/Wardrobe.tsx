import { SearchIcon } from '@/components/Icons/SearchIcon';
import { NFTMetadata } from '@/types';
import useStore, { UIMode, WardrobeMode } from '@/utils/store';
import {
  baycWorldcupClothing,
  coolcatWorldcupClothing,
  penguinWorldcupClothing,
} from '@/utils/worldcup';
import classNames from 'classnames';
import { useEffect, useMemo } from 'react';
import CollectibleCard from '../Card';

const CATEGORIES = [
  { icon: 'wardrobe-shirt', mode: WardrobeMode.Shirt },
  { icon: 'wardrobe-hat', mode: WardrobeMode.Hat },
  { icon: 'wardrobe-glasses', mode: WardrobeMode.Glasses },
  { icon: 'wardrobe-earrings', mode: WardrobeMode.Earrings },
];

const CategoryButton = ({
  icon,
  onClick,
  selected = false,
}: {
  icon: string;
  onClick: () => void;
  selected?: boolean;
}) => {
  const imgSrc = selected ? `/img/${icon}-selected.png` : `/img/${icon}.png`;

  return (
    <button
      className={classNames({
        'p-2 relative flex items-center justify-center border-r shadow-lg bg-dark-turquoise/[.05] hover:bg-dark-turquoise/[.2] w-[43px] h-[43px] border-denim-blue/[0.15] shadow-astronaut-blue/[0.25]':
          true,
        'bg-[#136161]': selected,
      })}
      onClick={onClick}
    >
      <img src={imgSrc} alt="category" />
    </button>
  );
};

// TODO: Dynamically load avatars from backend
const clothing: NFTMetadata[] = [
  {
    name: 'BAYC coat',
    image: 'https://rolling-filters.s3.amazonaws.com/images/ape-coat.png',
    model_url: 'https://rolling-filters.s3.amazonaws.com/3d/ape_coat.glb',
    category: 'clothing',
  },
  {
    name: 'BAYC robe',
    image:
      'https://rolling-filters.s3.amazonaws.com/images/C30_KingRobe_SkinWeight_Animation.png',
    model_url:
      'https://rolling-filters.s3.amazonaws.com/3d/C30_KingRobe_SkinWeight_Animation.glb',
    category: 'clothing',
  },
  {
    name: 'BAYC Vietnam Jacket',
    image:
      'https://rolling-filters.s3.amazonaws.com/images/C15_VietnamJacket_SkinWeight.png',
    model_url:
      'https://rolling-filters.s3.amazonaws.com/3d/C15_VietnamJacket_SkinWeight.glb',
    category: 'clothing',
  },
];

const headwear: NFTMetadata[] = [
  {
    name: 'BAYC Kings Crown',
    image:
      'https://rolling-filters.s3.amazonaws.com/images/H37_KIngsCrown_Skinweight.png',
    model_url:
      'https://rolling-filters.s3.amazonaws.com/3d/H37_KIngsCrown_Skinweight.glb',
    category: 'headwear',
  },
];

const eyewear: NFTMetadata[] = [
  {
    name: 'BAYC Sunglasses',
    image:
      'https://rolling-filters.s3.amazonaws.com/images/E7_Scumbag_SkinWeight.png',
    model_url:
      'https://rolling-filters.s3.amazonaws.com/3d/E7_Scumbag_SkinWeight.glb',
    category: 'eyewear',
  },
];

interface WardrobeProps {
  selectedAccessories: NFTMetadata[];
  setSelectedAccessories: (accessories: NFTMetadata[]) => void;
}

const Wardrobe = (props: WardrobeProps) => {
  const { selectedAccessories, setSelectedAccessories } = props;
  const uiMode = useStore((state) => state.uiMode);
  const setUIMode: any = useStore((state) => state.setUIMode);
  const wardrobeMode = useStore((state) => state.wardrobeMode);
  const setWardrobeMode: any = useStore((state) => state.setWardrobeMode);
  const selectedModelData: any = useStore((state) => state.selectedModelData);
  const setSelectedClothingData: any = useStore(
    (state) => state.setSelectedClothingData
  );
  const selectedClothingData: any = useStore(
    (state) => state.selectedClothingData
  );

  const onSelectAccessory = async (modelData: NFTMetadata) => {
    const isAlreadySelected = selectedClothingData.some(
      (item) => item.model_url === modelData.model_url
    );
    if (isAlreadySelected) {
      // If the accessory is already selected, remove it from the selected accessories
      const newAccessoryList = selectedClothingData.filter(
        (item) => item.model_url !== modelData.model_url
      );
      setSelectedClothingData(newAccessoryList);
    } else {
      // If another accessory of same category is already selected, remove it and add the new one
      const sameCategorySelected = selectedClothingData.some(
        (item) => item.category === modelData.category
      );
      if (sameCategorySelected) {
        const newAccessoryList = [
          ...selectedClothingData.filter(
            (item) => item.category !== modelData.category
          ),
          modelData,
        ];
        setSelectedClothingData(newAccessoryList);
      } else {
        setSelectedClothingData([...selectedClothingData, modelData]);
      }
    }
  };

  const setClothingByCollection = () => {
    switch (selectedModelData.name) {
      case 'BAYC':
        setSelectedAccessories(baycWorldcupClothing);
        break;
      case 'Cool Cats':
        setSelectedAccessories(coolcatWorldcupClothing);
        break;
      case 'Pudgy Penguins':
        setSelectedAccessories(penguinWorldcupClothing);
        break;
      default:
        setSelectedAccessories(baycWorldcupClothing);
        break;
    }
  };

  useEffect(() => {
    switch (wardrobeMode) {
      case WardrobeMode.Shirt:
        setClothingByCollection();
        break;
      case WardrobeMode.Hat:
        setSelectedAccessories(headwear);
        break;
      case WardrobeMode.Glasses:
        setSelectedAccessories(eyewear);
        break;
    }
  }, [wardrobeMode]);

  const boxTitle = useMemo(() => {
    if (uiMode !== UIMode.Wardrobe) return 'Wardrobe';
    if (wardrobeMode === WardrobeMode.Shirt) return 'Shirts';
    if (wardrobeMode === WardrobeMode.Hat) return 'Hats';
    if (wardrobeMode === WardrobeMode.Glasses) return 'Glasses';
    if (wardrobeMode === WardrobeMode.Earrings) return 'Earrings';
  }, [uiMode, wardrobeMode]);

  return (
    <div
      className={classNames({
        'absolute bottom-0 left-0 right-0 overflow-hidden flex flex-col': true,
        'top-[calc(100%-88px)] overflow-hidden transition-all ease-linear duration-300':
          uiMode !== UIMode.Wardrobe,
        'top-[98px] transition-all ease-linear duration-300':
          uiMode === UIMode.Wardrobe,
      })}
    >
      <div className="flex items-center justify-between px-4 py-2 border bg-dark-turquoise/[0.13] border-denim-blue/[0.15]">
        <div className="text-base font-semibold text-white uppercase">
          {boxTitle}
        </div>
        <button className="ml-auto">
          <SearchIcon />
        </button>
      </div>
      <div className="flex border shadow-lg bg-dark-turquoise/[0.05] border-denim-blue/[0.15] shadow-astronaut-blue/[0.25]">
        <div className="flex">
          {CATEGORIES.map((category) => (
            <CategoryButton
              key={category.icon}
              icon={category.icon}
              onClick={() => {
                setUIMode(UIMode.Wardrobe), setWardrobeMode(category.mode);
              }}
              selected={
                wardrobeMode === category.mode && uiMode === UIMode.Wardrobe
              }
            />
          ))}
        </div>
      </div>
      <div className="px-3 py-6 overflow-hidden border border-t-0 shadow-lg scrollbar-gutter-centered hover:overflow-y-auto bg-dark-turquoise/[0.08] border-denim-blue/[0.15] shadow-malachite/[.05]">
        {wardrobeMode === WardrobeMode.Shirt && (
          <div className="flex flex-wrap justify-between">
            {selectedAccessories.map((props: NFTMetadata) => {
              return (
                <div className="w-[47.5%]" key={props.name}>
                  <CollectibleCard
                    isSelected={selectedClothingData.some(
                      (item) => item.model_url === props.model_url
                    )}
                    imageURL={props.image}
                    name={props.name}
                    onSelect={() => {
                      onSelectAccessory(props);
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wardrobe;
