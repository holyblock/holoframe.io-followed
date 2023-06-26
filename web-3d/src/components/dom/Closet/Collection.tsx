import useStore, { UIMode } from '@/utils/store';
import { ArrowRightIcon } from '@/components/Icons/ArrowRightIcon';
import Image from 'next/image';
import { useRouter } from 'next/router';


const PROPERTIES = [
  { name: 'property name', rarityValue: 94, rarityText: 'Legendary' },
  { name: 'property name', rarityValue: 94, rarityText: 'Legendary' },
  { name: 'property name', rarityValue: 65, rarityText: 'Uncommon' },
  { name: 'property name', rarityValue: 65, rarityText: 'Uncommon' },
  { name: 'property name', rarityValue: 94, rarityText: 'Legendary' },
  { name: 'property name', rarityValue: 94, rarityText: 'Legendary' },
  { name: 'property name', rarityValue: 65, rarityText: 'Uncommon' },
  { name: 'property name', rarityValue: 65, rarityText: 'Uncommon' },
];

const Collection = () => {
  const uiMode: any = useStore((state) => state.uiMode);
  const selectedModelData: any = useStore((state) => state.selectedModelData);
  const selectedClothingData: any = useStore(
    (state) => state.selectedClothingData
  );
  const router = useRouter();


  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <div className="border border-b-0 bg-dark-turquoise/[.12] border-denim-blue/[.15]">
          <div className="py-2 text-xs font-medium text-center border-b text-aqua border-denim-blue/[.15]">
            Collection Name
          </div>
          <div className="py-2 text-base font-semibold text-center text-white uppercase">
            {uiMode === UIMode.Avatar
              ? selectedModelData.name
              : selectedClothingData[0].name}
          </div>
        </div>
        <div className="flex justify-center p-3 border bg-dark-turquoise/[.12] border-denim-blue/[.3] shadow-sm shadow-deep-teal">
          <div className="relative w-full aspect-square rounded-2xl">
            {uiMode === UIMode.Avatar ? (
              <Image
                src={selectedModelData.image}
                layout="fill"
                alt="image"
                style={{ borderRadius: '16px' }}
              />
            ) : (
              selectedClothingData.length > 0 && (
                <Image
                  src={selectedClothingData[0].image}
                  layout="fill"
                  alt="image"
                  style={{ borderRadius: '16px' }}
                />
              )
            )}
            <div className="absolute top-0 bottom-0 left-0 right-0 border shadow-lg border-hg-lime shadow-robin-egg-blue/[.2] rounded-2xl"></div>
            <div className="absolute border-t-4 border-l-4 -left-[1px] -top-[1px] rounded-tl-xl w-[34px] h-[34px] border-hg-lime"></div>
            <div className="absolute border-t-4 border-r-4 -right-[1px] -top-[1px] rounded-tr-xl w-[34px] h-[34px] border-hg-lime"></div>
            <div className="absolute border-b-4 border-l-4 -left-[1px] -bottom-[1px] rounded-bl-xl w-[34px] h-[34px] border-hg-lime"></div>
            <div className="absolute border-b-4 border-r-4 -right-[1px] -bottom-[1px] rounded-br-xl w-[34px] h-[34px] border-hg-lime"></div>
          </div>
        </div>
      </div>
      <div className="pr-2 -mr-5 overflow-hidden scrollbar-gutter hover:overflow-y-auto">
        {PROPERTIES.map((property, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-4 mb-2 border py-2.5 hover:bg-dark-turquoise/[.2] bg-dark-turquoise/[.12] border-denim-blue/[.15] shadow-sm shadow-astronaut-blue/[.25]"
          >
            <div>
              <div className="text-sm font-medium text-white uppercase">
                {property.name}
              </div>
              <div className="text-xs uppercase text-hg-gold font-tachyon">
                {property.rarityText}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-white uppercase">
                Rarity
              </div>
              <div className="text-xs text-hg-gold font-tachyon">
                {property.rarityValue}%
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-right">
        <button className="flex items-center px-6 py-3 ml-auto text-base font-semibold uppercase bg-white border border-black rounded-full gap-4"
          onClick={() => router.replace('/studio')}
        >
          Creator studio
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
};

export default Collection;
