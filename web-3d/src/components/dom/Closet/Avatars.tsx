import { NFTMetadata } from '@/types';
import useStore, { UIMode } from '@/utils/store';
import Image from 'next/image';
import CollectibleCard from '../Card';
import { UnionIcon } from '@/components/Icons/UnionIcon';
import { SearchIcon } from '@/components/Icons/SearchIcon';
import classNames from 'classnames';
import { useAccount } from 'wagmi';
import { SAMPLE_AVATARS } from '@/constants/samples';

const Avatars = () => {
  const { address } = useAccount();
  const uiMode = useStore((state) => state.uiMode);
  const setUIMode: any = useStore((state) => state.setUIMode);
  const setSelectedModelData: any = useStore(
    (state) => state.setSelectedModelData
  );
  const selectedModelData: any = useStore((state) => state.selectedModelData);

  const onSelectAvatar = async (modelData: NFTMetadata) => {
    setSelectedModelData(modelData);
  };

  const handleToggle = () => {
    if (uiMode === UIMode.Avatar) {
      setUIMode(UIMode.Default);
    } else {
      setUIMode(UIMode.Avatar);
    }
  };

  return (
    <div
      className={classNames({
        'absolute top-0 left-0 right-0 overflow-hidden': true,
        'bottom-[calc(100%-75px)] overflow-hidden transition-all ease-linear duration-300':
          uiMode !== UIMode.Avatar,
        'bottom-[115px] transition-all ease-linear duration-300':
          uiMode === UIMode.Avatar,
      })}
    >
      <div
        className="flex items-center border shadow-lg cursor-pointer hover:bg-dark-turquoise/[0.2] bg-dark-turquoise/[0.12] border-light-turquoise/[0.15] shadow-marine/[0.25]"
        onClick={handleToggle}
      >
        <Image
          width={73}
          height={73}
          src={selectedModelData.image}
          alt="avatar"
        />
        <div className="flex flex-1 px-5">
          <div>
            <div className="text-base font-semibold uppercase text-hg-lime">
              BORED APE #0001
            </div>
            <div className="text-xs font-medium text-aqua">
              Bored Ape Yacht Club
            </div>
          </div>
          <button className="ml-auto">
            <UnionIcon />
          </button>
        </div>
      </div>
      <div className="flex flex-col h-[calc(100%-75px)]">
        <div className="flex items-center justify-between px-4 py-2 border border-t-0 border-b-0 shadow-lg bg-dark-turquoise/[0.12] border-denim-blue/[0.15] shadow-astronaut-blue/[0.25]">
          <div className="text-base font-semibold text-white uppercase">
            {address ? 'Your avatars' : 'Browse Avatars'}
          </div>
          <button className="ml-auto">
            <SearchIcon />
          </button>
        </div>
        {!address && (
          <div className="px-4 py-3 font-light text-center text-gray-300 border-b text-[9px] bg-dark-turquoise/[0.24] border-denim-blue/[.15]">
            All the avatars below are samples for demo purposes. To use your own
            Holograms,{' '}
            <span className="underline cursor-pointer text-hg-lime">
              connect your crypto wallet.
            </span>
          </div>
        )}
        <div className="px-3 py-6 overflow-hidden border shadow-lg scrollbar-gutter-centered hover:overflow-y-auto bg-dark-turquoise/[0.12] border-light-turquoise/[0.15] shadow-marine/[0.25]">
          <div className="flex flex-wrap justify-between">
            {SAMPLE_AVATARS.map((props: NFTMetadata) => {
              return (
                <div className="w-[47.5%]" key={props.name}>
                  <CollectibleCard
                    isSelected={
                      props.model_url === selectedModelData?.model_url
                    }
                    imageURL={props.image}
                    name={props.name}
                    onSelect={() => {
                      onSelectAvatar(props);
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Avatars;
