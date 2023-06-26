import { useEffect, useState } from 'react';
import CollectibleCard from '../Card';
import useStore, { EnvironmentMode } from '@/utils/store';
import { NFTMetadata } from '@/types';
import { environment2Ds } from '@/utils/environment';
import classNames from 'classnames';

const CATEGORIES = [
  { icon: 'environment-back', mode: EnvironmentMode.Back },
  { icon: 'environment-face', mode: EnvironmentMode.Face },
  { icon: 'environment-hand', mode: EnvironmentMode.Hand },
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

const Environments = ({isVisible}) => {
  const setSelected2DEnvironmentData: any = useStore(
    (state) => state.setSelected2DEnvironmentData
  );
  const selected2DEnvironmentData: any = useStore(
    (state) => state.selected2DEnvironmentData
  );

  const onSelectEnvironment = async (modelData: NFTMetadata) => {
    setSelected2DEnvironmentData(modelData);
  };

  const renderEnvironments = environment2Ds.map((props: NFTMetadata) => {
    return (
      <div className="w-[100%]" key={props.name}>
        <CollectibleCard
          key={props.name}
          isSelected={props.name === selected2DEnvironmentData.name}
          imageURL={props.image}
          name={props.name}
          onSelect={() => {
            onSelectEnvironment(props);
          }}
        />
      </div>
    );
  });

  return (
    <div
      style={{
        zIndex: 100,
      }}
      className={classNames({
        'absolute bottom-0 right-0 modal top-0 z-index overflow-hidden flex flex-col w-[400px]':
          true,
        'right-[0px]': isVisible,
        'right-[-400px]': !isVisible

      })}
    >
      <div className="flex items-center justify-between px-4 py-2 border bg-dark-turquoise/[0.13] border-denim-blue/[0.15]">
        <div className="text-base font-semibold text-white uppercase">
          SCENES
        </div>
      </div>
      <div className="flex border shadow-lg bg-dark-turquoise/[0.05] border-denim-blue/[0.15] shadow-astronaut-blue/[0.25]">
        <div className="flex">
          {CATEGORIES.map((category) => (
            <CategoryButton
              key={category.icon}
              icon={category.icon}
              onClick={() => {}}
              selected={category.mode == EnvironmentMode.Back}
            />
          ))}
        </div>
      </div>
      <div className="px-3 py-6 overflow-hidden border border-t-0 shadow-lg scrollbar-gutter-centered hover:overflow-y-auto bg-dark-turquoise/[0.08] border-denim-blue/[0.15] shadow-malachite/[.05]">
        <div className="flex flex-wrap justify-between">
          {renderEnvironments}
        </div>
      </div>
    </div>
  );
};

export default Environments;
