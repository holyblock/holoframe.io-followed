import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { Image, Tooltip } from '@chakra-ui/react';

interface CollectibleCardProps {
  name?: string;
  isSelected: boolean;
  imageURL: string;
  onSelect: (e: any) => void;
}

const CollectibleCard = (props: CollectibleCardProps) => {
  const { name, isSelected, imageURL, onSelect } = props;
  const [selected, setSelected] = useState(isSelected ?? false);
  const [display, setDisplay] = useState(true);

  useEffect(() => {
    if (isSelected !== undefined) {
      setSelected(isSelected);
    }
  }, [isSelected]);

  return (
    <div className="mb-2">
      <div
        className={classNames({
          'relative rounded-2xl cursor-pointer': true,
          block: display,
          hidden: !display,
        })}
        onClick={onSelect}
      >
        <Image
          objectFit="cover"
          src={imageURL}
          borderRadius={16}
          w="100%"
          height="100%"
          alt="nft"
          onError={(i: any) => {
            // If image doesn"t load correctly, hide from user
            i.target.style.display = 'none';
            setDisplay(false);
          }}
        />
        {selected ? (
          <>
            <div className="absolute top-0 bottom-0 left-0 right-0 border shadow-lg border-hg-lime shadow-robin-egg-blue/[.2] rounded-2xl"></div>
            <div className="absolute border-t-4 border-l-4 -left-[1px] -top-[1px] rounded-tl-xl w-[34px] h-[34px] border-hg-lime"></div>
            <div className="absolute border-t-4 border-r-4 -right-[1px] -top-[1px] rounded-tr-xl w-[34px] h-[34px] border-hg-lime"></div>
            <div className="absolute border-b-4 border-l-4 -left-[1px] -bottom-[1px] rounded-bl-xl w-[34px] h-[34px] border-hg-lime"></div>
            <div className="absolute border-b-4 border-r-4 -right-[1px] -bottom-[1px] rounded-br-xl w-[34px] h-[34px] border-hg-lime"></div>
          </>
        ) : (
          <div className="absolute top-0 bottom-0 left-0 right-0 border shadow-lg opacity-50 hover:opacity-20 bg-sherpa-blue border-aqua shadow-astronaut-blue/[.25] rounded-2xl"></div>
        )}
      </div>
      <p
        className={classNames({
          'mt-1 text-xs font-normal text-center mb-2': true,
          'text-aqua': !selected,
          'text-hg-lime': selected,
        })}
      >
        {name}
      </p>
    </div>
  );
};

export default CollectibleCard;
