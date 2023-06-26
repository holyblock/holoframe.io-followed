import fetch from 'node-fetch';
import fs from 'fs';

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const CAMERA_DRIVER_S3_BUCKET =
  'https://hologramxyz.s3.amazonaws.com/build/desktop/driver/windows';

const winCameraDriverFiles = [
  'Install.bat',
  'HologramVirtualCam32.dll',
  'HologramVirtualCam64.dll',
];

// Windows-specific camera installer
export async function installCamera(): Promise<void> {
  if (process.platform === 'win32') {
    const fetchPromises: any = [];

    // Create application data folder
    if (!fs.existsSync('C:\\hologram')) {
      fs.mkdirSync('C:\\hologram');
    }

    // Fetch all windows camera driver files
    for (const currFile of winCameraDriverFiles) {
      const downloadFile = new Promise((resolve, reject) => {
        fetch(`${CAMERA_DRIVER_S3_BUCKET}/${currFile}`).then((res) => {
          const destFile = fs.createWriteStream(currFile); // Copy file locally
          res.body.pipe(destFile);
          res.body.on('end', () => resolve('it worked'));
          destFile.on('error', reject);
        });
      });
      fetchPromises.push(downloadFile);
    }
    await Promise.all(fetchPromises).then(async () => {
      // Run driver install script
      await exec(`Install.bat`);

      // Remove camera driver files
      // for (const currFile of winCameraDriverFiles) {
      //   fs.unlinkSync(currFile);
      // }
    });
  }
}
