import * as axios from 'axios';
import path from 'path';
import jszip from 'jszip';
import mime from 'mime-types';

const TRANSPARENT_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E`;

export const handleLive2dZip = async (link: string, selectedTextures?: number[]) => {
  const buffer = await getFileContentAsBuffer(link);
  return await getEncodedLive2dJsonFromBuffer(buffer, selectedTextures);
}

export const getEncodedLive2dJsonFromBuffer = async (
  buffer: Buffer,
  selectedTextures?: number[]
) => {
  const zip = await jszip.loadAsync(buffer);
  const zipEntries = Object.keys(zip.files);

  let filenameRoot: string | undefined;
  // Get live2d model file
  let live2dModelFile;
  let expFiles: string[] = [];
  for (let entry of zipEntries) {
    if (!filenameRoot) {
      filenameRoot = entry.replace('/', '');
    }
    if (
      entry.includes('.') &&
      !entry.includes('__MACOSX')
    ) {
      if (
        entry.includes('.model.json') ||
        entry.includes('.model3.json')
      ) {
        live2dModelFile = entry;
      } else if (entry.includes('.exp3.json')) {
        // Get expressions file paths
        expFiles.push(entry);
      }
    }
  };

  // Iterate through model file content and replace paths with dataURL
  if (live2dModelFile && filenameRoot) {
    // Get model data and convert to dataURL
    const modelFileDataString = await zip.file(live2dModelFile)?.async('string');
    const modelFileData = JSON.parse(modelFileDataString!);

    let textureNames: string[] = [];
    const changeFilenameToData = async (filename: string, i: number) => {
      // Populate texture names in use
      if (filename.includes('.png')) {
        const textureName = filename.split('/')?.pop()?.split('.')[0];
        if (textureName) textureNames.push(textureName);

        // Replace unselected textures with transparent SVG
        if (selectedTextures !== undefined && !selectedTextures.includes(+i)) {
          return TRANSPARENT_SVG;
        }
      }

      // Construct base64 encoded dataURL
      if (filename.includes('.')) {
        const fileExtension = filename.split('.').pop();
        const dataPath = path.join(filenameRoot!, filename);
        const data = await zip.file(dataPath)?.async('arraybuffer');
        if (data) {
          const mediaType = getMediaType(fileExtension!);
          if (mediaType) {
            return getDataURL(mediaType, data);
          };
        }
      };
      return filename;
    }
    // Replace relative paths to data URLs in model3.json
    await recurseObj(modelFileData, changeFilenameToData);

    // Get expressions data as dictionary
    const expMap: Map<string, Array<object>> = new Map();
    for (const expFile of expFiles) {
      const expName: string = expFile.slice(
        expFile.lastIndexOf('/') + 1, expFile.indexOf('.exp3')
      );
      const expDataString = await zip.file(expFile)?.async('string');
      const expData = JSON.parse(expDataString!);
      expMap.set(expName, expData.Parameters)
    }
    return {
      model: modelFileData,
      expressions: expMap,
      textures: textureNames
    }
  } else {
    return {};
  }
}

// Helper to get the MIME type from file extension
const live2dFileExtensions = ['moc', 'moc3', 'mtn'];
const getMediaType = (extension: string) => {
  let mediaType;
  if (live2dFileExtensions.includes(extension)) {
    mediaType = 'application/octed-stream';
  } else {
    mediaType = mime.lookup(extension);
  }
  return mediaType;
}

// Helper to turn file URL to data buffer
const getFileContentAsBuffer = async (download_url: string) => {
  const response = await axios.default.get(download_url, {
    responseType: 'arraybuffer',
  });
  return Buffer.from(response.data, 'base64');
}

// Helper function to recurse through object
const recurseObj = async (
  obj: any,
  mutate: (k: string, i: number) => Promise<any>
) => {
  // the recursive iterator
  const walker = async (obj: any) => {
    let k, has = Object.prototype.hasOwnProperty.bind(obj);
    for (k in obj) if (has(k)) {
      switch (typeof obj[k]) {
        case 'object':
          await walker(obj[k]);
          break;
        case 'string':
          obj[k] = await mutate(obj[k], k);
      }
    }
  }
  // set it running
  await walker(obj);
  return obj;
};

// Helper function for converting ipfs hash into url
export const ipfsHashToImageUrl = (ipfsHash: string) => {
  const hash = ipfsHash.replace('ipfs://', '');
  return `https://ipfs.io/ipfs/${hash}`;
};

// Helper function for converting image url into object url
export const getObjectUrl = async (imageUrl: string) => {
  const response = await axios.default.get(imageUrl);
  return URL.createObjectURL(response.data);
}

// Helper function to get the base64-encoded data URL
export const getDataURL = async (mediaType: string, data: any) => {
  const base64EncodedData = await Buffer.from(data).toString('base64');
  const dataURL = `data:${mediaType};base64,${base64EncodedData}`;
  return dataURL;
}