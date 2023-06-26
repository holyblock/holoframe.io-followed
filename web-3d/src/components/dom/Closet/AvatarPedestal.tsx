import Image from 'next/image';
import avatarPedestal from '../../../../public/img/avatar-pedestal.svg';

const AvatarPedestal = () => {
  return (
    <div className="absolute inset-0 flex justify-center pointer-events-none min-w-[1000px] max-lg:translate-x-44">
      <Image
        src={avatarPedestal}
        objectFit="contain"
        objectPosition="bottom"
        alt="avatar-pedestal"
      />
    </div>
  );
};

export default AvatarPedestal;
