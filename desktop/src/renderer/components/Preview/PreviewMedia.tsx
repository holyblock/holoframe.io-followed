import { useCanvas } from 'renderer/contexts/CanvasContext';
import { usePreviewMedia } from 'renderer/contexts/PreviewMediaContext';
import { MediaType } from '../../../../../utils/types/index';

const PreviewMedia = () => {
  const { videoRef } = useCanvas();
  const { previewMediaDataUrl, previewGifDataUrl, previewMediaType } =
    usePreviewMedia();

  return (
    <>
      <video
        ref={videoRef}
        id="input-video"
        autoPlay
        controls
        crossOrigin="anonymous"
        loop
        style={{
          display: previewMediaType === MediaType.GIF ? 'none' : 'block',
        }}
      >
        {!!previewMediaDataUrl && (
          <source src={previewMediaDataUrl} type="video/mp4" />
        )}
      </video>
      {previewMediaType === MediaType.GIF && (
        <img
          src={previewGifDataUrl}
          alt="Preview Gif"
          style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
        />
      )}
    </>
  );
};

export default PreviewMedia;
