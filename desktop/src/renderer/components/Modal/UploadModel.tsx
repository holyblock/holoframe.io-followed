import { Tooltip } from '@chakra-ui/react';
import { useRef } from 'react';
import IconButton from 'renderer/components/Button/IconButton';
import { useNFT } from 'renderer/contexts/NFTContext';
import { NFTMetadata } from 'renderer/types';
import uploadSvgIcon from '../../../../assets/img/upload.svg';

const UploadModel = () => {
  const { setSelectedHologram } = useNFT();
  const hiddenFileInput = useRef<any>(null);

  const onUpload = () => {
    hiddenFileInput.current.click();
  };

  const onInput = async (e: any) => {
    e.preventDefault();
    const reader = new FileReader();
    const file = e.target?.files[0];
    reader.readAsDataURL(file);

    // Get model type
    let modelType = '3d';
    if (
      file.type === 'application/zip' ||
      file.type === 'application/x-zip-compressed' ||
      file.type === 'application/x-zip'
    ) {
      modelType = 'live2d';
    }

    // Get file format
    const fileFormat = file.name.split('.').pop();
    reader.onloadend = async (res) => {
      const modelData: NFTMetadata = {
        name: file.name,
        image: '',
        id: file.name,
        model_url: res.target?.result as string,
        type: modelType,
        format: fileFormat,
      };

      setSelectedHologram(modelData);
    };
  };
  return (
    <>
      <IconButton icon={uploadSvgIcon} onClick={onUpload} />
      <input
        ref={hiddenFileInput}
        onInput={onInput}
        type="file"
        accept=".zip,.7zip,.glb,.vrm"
        style={{ display: 'none' }}
      />
    </>
  );
};

export default UploadModel;
