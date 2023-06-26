import React, { useEffect, useState } from 'react';

const usePlatform = () => {
  const [platform, setPlatform] = useState('');

  useEffect(() => {
    setPlatform(process.platform);
  }, []);

  return platform;
};

export default usePlatform;
