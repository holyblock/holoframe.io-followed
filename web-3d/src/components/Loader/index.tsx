import React, { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import AvatarPedestal from '../dom/Closet/AvatarPedestal';
import avatarLoadingBody from '../../../public/img/avatar-loading-body.png';
import Image from 'next/image';

const Loader = ({ onFinished }) => {
  const { active, progress, errors, item, loaded, total } = useProgress();

  const [loading, setLoading] = useState(0);

  useEffect(() => {
    // handle edge case where progress was decreasing
    if (progress > loading) {
      setLoading(Math.round(progress));
    }

    if (progress == 100) {
      onFinished();
    }
  }, [loading, progress, onFinished]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full">
      <div className="mb-4 text-2xl font-semibold text-white">
        LOADING CLOSET
      </div>
      <div className="w-2/3 h-1 mb-1 border box-border bg-dark-turquoise/[0.13] border-denim-blue/[0.15]">
        <div
          className="h-full bg-loading-glow-bar transition-all shadow-loading-glow"
          style={{ width: `${loading}%` }}
        />
      </div>
      <div className="text-base font-normal font-tachyon text-aqua">
        {loading}%
      </div>
      <AvatarPedestal />
      <div className="absolute flex items-center justify-center w-full mt-12 h-4/5">
        <Image
          src={avatarLoadingBody}
          layout="fill"
          objectFit="contain"
          alt="avatar-loading-body"
        />
      </div>
    </div>
  );
};

export default Loader;
