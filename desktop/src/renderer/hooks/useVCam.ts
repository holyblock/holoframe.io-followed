import { useEffect, useRef } from 'react';
import fs from 'fs';
import config from '../../../../utils/config';

const useVCam = () => {
  const updateVCamFn = useRef<(buffer: Buffer) => void>(null);

  // Set VCam update function
  useEffect(() => {
    const opsys = process.platform;
    if (opsys === 'darwin') {
      // MacOS
      const updateFn = (buffer: Buffer) => {
        const tempPath = `${config.desktop.vcam.dir.mac}/${config.desktop.vcam.file.temp}`;
        if (buffer) fs.writeFileSync(tempPath, buffer);

        const finalPath = `${config.desktop.vcam.dir.mac}/${config.desktop.vcam.file.final}`;
        fs.rename(tempPath, finalPath, () => null);
      };
      updateVCamFn.current = updateFn;
    } else if (opsys === 'win32') {
      // Create application data folder if it doesn't exist
      if (!fs.existsSync(config.desktop.vcam.dir.windows)) {
        fs.mkdirSync(config.desktop.vcam.dir.windows);
      }
      // Windows
      const updateFn = (buffer: Buffer) => {
        const path = `${config.desktop.vcam.dir.windows}\\${config.desktop.vcam.file.final}`;
        if (buffer) fs.writeFileSync(path, buffer);
      };
      updateVCamFn.current = updateFn;
    }
  }, []);

  return {
    updateVCam: updateVCamFn,
  };
};
export default useVCam;
