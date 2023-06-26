import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link'
import { useRouter } from 'next/router';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { Button, IconButton, Fade, Container, Heading, Spinner, Flex, FormControl, FormLabel, Textarea, Input, Text } from '@chakra-ui/react';
import TokenCreate from '../../../../components/Contract/TokenCreate';
import { db } from '../../../../utils/firebaseClient';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Dropzone from '../../../../components/Input/Dropzone';
import { colors } from '../../../../styles/theme';
import { uploadFileToS3 } from '../../../../utils/s3Client';
import config from '../../../../../../utils/config';
import AppNavigationBar from '../../../../components/NavigationBar/AppNavigationBar';
import { useAuth } from '../../../../contexts/AuthContext';

// Modal for minting a Hologram token in a collection
const Mint = () => {
  const router = useRouter();
  const { address } = useAuth();
  const { cid } = router.query;
  const fetched = useRef(false);
  const [collectionData, setCollectionData] = useState<any>();
  const [uniqueTokenID, setUniqueTokenID] = useState('');
  const [tokenURI, setTokenURI] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [description, setDescription] = useState('');
  const [modelFile, setModelFile] = useState<any>(); // { filename, result, filetype }
  const [imageFile, setImageFile] = useState<any>();
  const [readyForMint, setReadyForMint] = useState(false);
  const [readyForUpload, setReadyForUpload] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [uploadClicked, setUploadClicked] = useState(false);

  // TODO: Redirect to collections view if no cid found in route
  // useEffect(() => {
  //   if (!cid) {
  //     router.push('/creator/collections');
  //   }
  // }, [cid]);

  // Reset state on route change
  const resetState = () => {
    fetched.current = false;
    setCollectionData(undefined);
    setUniqueTokenID('');
    setTokenURI('');
    setTokenName('');
    setDescription('');
    setModelFile(undefined);
    setImageFile(undefined);
    setReadyForMint(false);
    setReadyForUpload(false);
    setUploaded(false);
    setUploadClicked(false);
  };
  useEffect(() => {
    const handleRouteChange = (url) => {
      resetState();
    }
    router.events.on('routeChangeStart', handleRouteChange)

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, []);

  // Fetch collection data
  useEffect(() => {
    (async () => {
      if (cid && !fetched.current) {
        const collectionDocRef = doc(db, 'Collection', cid as string);
        const collectionSnap = await getDoc(collectionDocRef);
        if (collectionSnap.exists()) {
          const currData = collectionSnap.data();
          setCollectionData(currData);
        } else {
          router.push('/studio');
        }
        fetched.current = true;
      }
    })();
  }, [cid]);

  // Updates ready state for allowing prepare / mint button to be pressed
  useEffect(() => {
    if (tokenName && description && imageFile && modelFile) {
      setReadyForUpload(true);
      if (uploaded) {
        setReadyForMint(true);
      }
    } else {
      setReadyForUpload(false);
      setReadyForMint(false);
    }
  }, [tokenName, description, imageFile, modelFile, uploaded]);

  // Handlers for file upload dropzones
  const onModelFileDrop = useCallback(async (acceptedFiles) => {
    acceptedFiles.map((file) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target) {
          const filename = file.name;
          const fileFormat = filename.split('.').pop();

          // Check if uploaded file type is supported
          if (Object.keys(config.nfts.supported).includes(fileFormat)) {
            const dataURL = e.target.result as string;
            const contentType = dataURL.substring(dataURL.indexOf(":")+1, dataURL.indexOf(";"));

            // Check if content type is supported
            if (contentType === 'application/zip' || contentType === 'application/octet-stream') {
              setModelFile({
                filename: filename,
                result: dataURL,
                modelType: config.nfts.supported[fileFormat],
                format: fileFormat,
                contentType: contentType,
              });    
            }
          }
        }
      };
      reader.readAsDataURL(file);
      return file;
    });
  }, []);
  const onImageFileDrop = useCallback(async (acceptedFiles) => {
    acceptedFiles.map((file) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target) {
          const dataURL = e.target.result as string;
          const contentType = dataURL.substring(dataURL.indexOf(":")+1, dataURL.indexOf(";"));

          // Check if content type is supported
          if (contentType === 'image/png' || contentType === 'image/jpeg') {
            setImageFile({
              filename: file.name,
              result: dataURL,
              contentType: contentType
            });     
          }
        }
      };
      reader.readAsDataURL(file);
      return file;
    });
  }, []);

  // Upload all files to S3
  const onUpload = async () => {
    if (modelFile) {
      setUploadClicked(true);
      const ownerAddr = address!;
      // Upload model file to S3
      const modelBuffer = new Buffer(modelFile.result.split(",")[1], 'base64');
      const modelS3Key = `creator/${ownerAddr}/collections/${cid as string}/models/${modelFile.filename}`;
      const modelURL = await uploadFileToS3(modelS3Key, modelBuffer, modelFile.contentType);

      // Upload image file to S3
      const imageUploadRes = await fetch('/api/image/upload', {
        method: 'POST',
        body: JSON.stringify({
          account: ownerAddr,
          cid: cid as string,
          filename: imageFile?.filename,
          result: imageFile.result,
          contentType: imageFile.contentType
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const imageUploadData = await imageUploadRes.json();
      const imageURL = imageUploadData.imageURL;


      // Generate a new token ID w/ format: ownerAddr-collectionID-tokenNumber
      const tokenNumber = (collectionData.tokens?.length ?? 0) + 1;
      const tID = `${ownerAddr}-${cid as string}-${tokenNumber}`;
      setUniqueTokenID(tID);

      // Upload token URI file to S3
      const result = JSON.stringify({
        name: tokenName,
        project: collectionData.name,
        description: description,
        type: modelFile.modelType,
        model_url: modelURL,
        image: imageURL,
        format: modelFile.format,
        // animation_url: animationURL
      });
      const buffer = Buffer.from(result);
      const contentType = 'application/json';
      const filename = `${tID}.json`;
      const s3Key = `creator/${ownerAddr}/collections/${cid}/URIs/${filename}`;
      const uri = await uploadFileToS3(s3Key, buffer, contentType);
      setTokenURI(uri);

      // Upload token data to firebase
      try {
        // Add to Token db (without addr)
        await setDoc(doc(db, 'Token', tID),{
          id: tID,
          collectionID: collectionData.id,
          minterAddr: address!,
          name: tokenName,
          description: description,
          tokenURI: uri,
          modelURL: modelURL,
          image: imageURL,
          type: modelFile.modelType,
          minted: false,
          format: modelFile.format
        }, { merge: true });
        setUploaded(true);
      } catch (e) {
        console.error('Error adding document', e);
      }
    }
  }

  return (
    <Fade in={true}>
      <AppNavigationBar />
      <Flex pt='70px' flexDir='column' justifyContent='center' alignItems='center'>
        <Flex h={0} w='container.lg' px='1rem' justifyContent='space-between'>
          <Link href={`/creator/collections/${cid as string}`} passHref>
            <IconButton
              aria-label='back'
              variant='unstyled'
              borderRadius='25px'
              _hover={{
                color: colors.brand.primary
              }}
              icon={<ArrowBackIcon fontSize='2xl' />}
            />
          </Link>
          <div />
        </Flex>
        <Container
          display='flex'
          alignItems='center'
          flexDir='column'
          py={10}
          maxW={['container.xl', 'container.lg', 'container.sm']}
          textAlign='left'
        >
          <Heading 
            as='h1' 
            size='xl' 
            mb={5}
          >
            Create Hologram
          </Heading>
          <Text mb={5}>
            Bring your Live2D or 3D character to life on Hologram!
          </Text>
          <FormControl mb={5} px={10}>
            <FormLabel fontWeight='bold'>Title</FormLabel>
            <Input 
              h='50px'
              value={tokenName} 
              onChange={(e) => setTokenName(e.currentTarget.value)}
              focusBorderColor='purple.200'
              required
              placeholder='E.g. Holotuber'
            />
          </FormControl>
          <FormControl mb={5} px={10}>
            <FormLabel fontWeight='bold'>Description</FormLabel>
            <Textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Your digital identity, powered by hologram.xyz'
              focusBorderColor='purple.200'
            />
          </FormControl>
          <FormControl mb={5} px={10}>
            <FormLabel fontWeight='bold'>Model</FormLabel>
            <Dropzone
              accept={'.zip,.7zip,.glb,.vrm'}
              currFile={modelFile}
              placeholder='Accepts .zip (live2D), .glb, or .vrm file'
              droppedFilename={modelFile?.filename}
              onDrop={onModelFileDrop}
            />
          </FormControl>
          <FormControl mb={5} px={10}>
            <FormLabel fontWeight='bold'>Preview Image</FormLabel>
            <Dropzone
              accept={'.png,.jpg,.jpeg'}
              currFile={imageFile}
              placeholder='Accepts .png or .jpeg file'
              droppedFilename={imageFile?.filename}
              onDrop={onImageFileDrop}
            />
          </FormControl>
          { !uploadClicked &&
            <Button
              disabled={!readyForUpload}
              variant='outline'
              ml='12px'
              onClick={onUpload}
              _hover={{
                color: !readyForUpload ? 'inherit' : 'black',
                bgColor: !readyForUpload ? 'inherit': colors.brand.primary,
                borderColor: 'black'
              }}
            >
              Prepare for Mint
            </Button>
          }
          { uploadClicked && !uploaded &&
            <Flex 
              flexDir='column'
              alignItems='center'
            >
              <Spinner />
              <Text pt={4}>
                Preparing, one moment...
              </Text>
            </Flex>
          }
          { uploadClicked && uploaded &&
            <TokenCreate
              ready={readyForMint}
              account={address!}
              collection={collectionData}
              uniqueTokenID={uniqueTokenID}
              tokenURI={tokenURI}
            />
          }
        </Container>
      </Flex>
    </Fade>
  );
};

export default Mint;