import {
  Box,
  Button as ChakraButton,
  Heading,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  ModalBody,
  ModalFooter,
  Spinner,
  Flex,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { BiDownload } from 'react-icons/bi';
import { AiOutlineTwitter } from 'react-icons/ai';
import { FiLink2 } from 'react-icons/fi';
import Modal from 'renderer/components/Modal';
import Button from 'renderer/components/Button';
import mixpanel from 'mixpanel-browser';
import { useAuth } from 'renderer/contexts/AuthContext';
import { useNFT } from 'renderer/contexts/NFTContext';
import { colors } from 'renderer/styles/theme';
import config from '../../../../../utils/config';

interface StudioSharingProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  screenshot?: string;
  recordData?: string;
  shareable: boolean;
}

const StudioSharing = (props: StudioSharingProps) => {
  const { isOpen, setIsOpen, screenshot, recordData, shareable } = props;
  const [isUploading, setIsUploading] = useState(false);
  const [displayShare, setDisplayShare] = useState(false);
  const [showDownloadSpinner, setShowDownloadSpinner] = useState(false);
  const [showShareSpinner, setShowShareSpinner] = useState(false);
  const [videoFormat, setVideoFormat] = useState<string>();
  const [mediaUrl, setMediaUrl] = useState<string>();
  const [copiedLink, setCopiedLink] = useState(false);
  const [fileName, setFileName] = useState<string>();
  const { userAddress } = useAuth();
  const { selectedHologram } = useNFT();

  const saveFile = () => {
    if (!mediaUrl) return;
    const ext = screenshot ? 'png' : videoFormat === 'mp4' ? 'mp4' : 'gif';
    const a = document.createElement('a');
    a.href = mediaUrl;
    a.download = `hologram.${ext}`;
    a.dispatchEvent(new MouseEvent('click'));
    a.remove();
  };

  const shareFile = () => {
    if (!fileName) return;
    const format = screenshot ? 'png' : videoFormat === 'gif' ? 'gif' : 'mp4';
    const shareText = 'Made%20on%20@HologramLabs%20%23HoloTuber';
    const shareUrl = `https://hologram.xyz/post/${fileName}?format=${format}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
    window.open(twitterUrl, '_blank', 'popup');
  };

  const uploadVideo = async () => {
    setIsUploading(true);
    try {
      const res = await fetch(recordData);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append('file', blob);
      formData.append('userAddress', userAddress);
      formData.append('metadata', JSON.stringify(selectedHologram));
      const url = `${config.apiUrl}/media/upload${
        videoFormat === 'gif' ? '/gif' : ''
      }`;
      const videoRes = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      if (!videoRes.ok) {
        setIsUploading(false);
      } else {
        const videoBlob = await videoRes.blob();
        const contentDisposition = videoRes.headers.get('Content-Disposition');
        setFileName(
          contentDisposition.split(';')[1].split('=')[1].split('.')[0]
        );
        setMediaUrl(URL.createObjectURL(videoBlob));
      }
    } catch (err) {
      console.error(err);
    }
    setIsUploading(false);
  };

  const uploadImage = async () => {
    setIsUploading(true);
    try {
      const res = await fetch(screenshot);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append('file', blob);
      formData.append('userAddress', userAddress);
      formData.append('metadata', JSON.stringify(selectedHologram));
      const pngRes = await fetch(`${config.apiUrl}/media/upload/image`, {
        method: 'POST',
        body: formData,
      });
      if (!pngRes.ok) {
        setIsUploading(false);
      } else {
        const pngBlob = await pngRes.blob();
        const contentDisposition = pngRes.headers.get('Content-Disposition');
        setFileName(
          contentDisposition.split(';')[1].split('=')[1].split('.')[0]
        );
        setMediaUrl(URL.createObjectURL(pngBlob));
      }
    } catch (err) {
      console.error(err);
    }
    setIsUploading(false);
  };

  const handleDownloadVideo = async () => {
    if (isUploading) {
      setShowDownloadSpinner(true);
    } else {
      saveFile();
    }
  };

  const handleShareVideo = async () => {
    if (isUploading) {
      setShowShareSpinner(true);
    } else {
      shareFile();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setDisplayShare(false);
    setShowDownloadSpinner(false);
    setShowShareSpinner(false);
    setCopiedLink(false);
  };

  useEffect(() => {
    if (isOpen && (recordData || screenshot) && displayShare) {
      setShowDownloadSpinner(false);
      setShowShareSpinner(false);
      if (recordData) {
        uploadVideo();
      } else {
        uploadImage();
      }
    }
  }, [isOpen, recordData, screenshot, displayShare]);

  useEffect(() => {
    if (!isUploading) {
      if (showDownloadSpinner) {
        setShowDownloadSpinner(false);
      }
      if (showShareSpinner) {
        setShowShareSpinner(false);
      }
    }
  }, [isUploading]);

  useEffect(() => {
    if (!showDownloadSpinner) {
      saveFile();
    }
  }, [showDownloadSpinner]);

  useEffect(() => {
    if (!showShareSpinner) {
      shareFile();
    }
  }, [showShareSpinner]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      header={
        <Heading mb={2} textAlign="center" size="md">
          {!displayShare ? 'Preview your Hologram' : 'Share your Hologram'}
        </Heading>
      }
    >
      <ModalBody>
        {screenshot && (
          <img src={screenshot} alt="screenshot" crossOrigin="anonymous" />
        )}
        {recordData && (
          <video src={recordData} autoPlay loop crossOrigin="anonymous" />
        )}
      </ModalBody>
      {!displayShare && (
        <ModalFooter w="100%" display="flex" justifyContent="center">
          <Box mr={1} w="100%">
            {recordData ? (
              <a href={recordData} download="hologram.webm">
                <Button text="Download RAW" variant="outline" height="50px" />
              </a>
            ) : (
              <Button
                text="Cancel"
                variant="outline"
                height="50px"
                onClick={handleClose}
              />
            )}
          </Box>
          {screenshot && (
            <Box ml={1} w="100%">
              <Button
                text="Save & Share"
                color={colors.brand.primary}
                height="50px"
                onClick={() => {
                  setDisplayShare(true);
                }}
              />
            </Box>
          )}
          {recordData && (
            <Box ml={1} w="100%">
              <Menu>
                <Tooltip
                  label={
                    shareable
                      ? ''
                      : 'Only videos under 10 seconds can be shared for now.'
                  }
                >
                  <MenuButton
                    disabled={!shareable}
                    as={ChakraButton}
                    backgroundColor={colors.brand.primary}
                    colorScheme={colors.brand.primary}
                    width="100%"
                    height="50px"
                    onClick={() => {
                      setVideoFormat('mp4');
                      setDisplayShare(true);
                    }}
                  >
                    Save & Share
                  </MenuButton>
                </Tooltip>
                {/* <MenuList color="#000">
                  <MenuItem
                    onClick={() => {
                      setVideoFormat('mp4');
                      setDisplayShare(true);
                    }}
                  >
                    MP4
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setVideoFormat('gif');
                      setDisplayShare(true);
                    }}
                  >
                    GIF
                  </MenuItem>
                </MenuList> */}
              </Menu>
            </Box>
          )}
        </ModalFooter>
      )}
      {displayShare && screenshot && (
        <ModalFooter
          w="100%"
          display="flex"
          flexDir="column"
          alignItems="center"
        >
          {isUploading ? (
            <Flex flexDir="column" alignItems="center">
              <Spinner />
              <Text pt={2}>Preparing to share...</Text>
            </Flex>
          ) : (
            <>
              <Box mb={2} w="70%">
                <a href={screenshot} download="hologram.png">
                  <Button
                    text="Download"
                    color={colors.brand.primary}
                    height="50px"
                    icon={
                      <BiDownload fontSize={18} style={{ marginRight: 10 }} />
                    }
                    onClick={() => {
                      mixpanel.track('Media Shared', {
                        media_format: 'image',
                        type: 'download',
                      });
                    }}
                  />
                </a>
              </Box>
              <Box mb={2} w="70%">
                <Button
                  text="Share to Twitter"
                  color="#1DA1F2"
                  textColor="white"
                  height="50px"
                  icon={
                    <AiOutlineTwitter
                      fontSize={18}
                      style={{ marginRight: 10 }}
                    />
                  }
                  onClick={() => {
                    handleShareVideo();
                    mixpanel.track('Media Shared', {
                      media_format: 'image',
                      type: 'share',
                    });
                  }}
                />
              </Box>
              <Box mb={2} w="70%">
                <Button
                  text={!copiedLink ? 'Copy share link' : 'Copied!'}
                  color="black"
                  textColor="white"
                  height="50px"
                  icon={<FiLink2 fontSize={18} style={{ marginRight: 10 }} />}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `https://hologram.xyz/post/${fileName}?format=png`
                    );
                    mixpanel.track('Media Shared', {
                      media_format: 'image',
                      type: 'copy link',
                    });
                    setCopiedLink(true);
                  }}
                />
              </Box>
            </>
          )}
        </ModalFooter>
      )}
      {displayShare && recordData && (
        <ModalFooter
          w="100%"
          display="flex"
          flexDir="column"
          alignItems="center"
        >
          {isUploading ? (
            <Flex flexDir="column" alignItems="center">
              <Spinner />
              <Text pt={2}>Preparing to share...</Text>
            </Flex>
          ) : (
            <>
              <Box mb={2} w="70%">
                <Button
                  text="Download"
                  color={colors.brand.primary}
                  height="50px"
                  icon={
                    <BiDownload fontSize={18} style={{ marginRight: 10 }} />
                  }
                  onClick={() => {
                    handleDownloadVideo();
                    mixpanel.track('Media Shared', {
                      media_format: 'video',
                      type: 'download',
                    });
                  }}
                />
              </Box>
              <Box mb={2} w="70%">
                <Button
                  text="Share to Twitter"
                  color="#1DA1F2"
                  textColor="white"
                  height="50px"
                  icon={
                    <AiOutlineTwitter
                      fontSize={18}
                      style={{ marginRight: 10 }}
                    />
                  }
                  onClick={() => {
                    handleShareVideo();
                    mixpanel.track('Media Shared', {
                      media_format: 'video',
                      type: 'share',
                    });
                  }}
                />
              </Box>
              <Box mb={2} w="70%">
                <Button
                  disabled={isUploading || !fileName}
                  text={!copiedLink ? 'Copy share link' : 'Copied!'}
                  color="black"
                  textColor="white"
                  height="50px"
                  icon={<FiLink2 fontSize={18} style={{ marginRight: 10 }} />}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `https://hologram.xyz/post/${fileName}?format=${videoFormat}`
                    );
                    mixpanel.track('Media Shared', {
                      media_format: 'video',
                      type: 'copy link',
                    });
                    setCopiedLink(true);
                  }}
                />
              </Box>
            </>
          )}
        </ModalFooter>
      )}
    </Modal>
  );
};

export default StudioSharing;
