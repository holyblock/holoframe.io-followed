import React from 'react';
import { ArrowUpIcon } from '@chakra-ui/icons';
import { Center, VStack, Text } from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';

interface DropzoneProps {
  accept: string,
  currFile: any,
  placeholder: string,
  droppedFilename: string,
  onDrop: (acceptedFiles: any) => Promise<void>
}

// UI for drag-and-drop file upload modal
const Dropzone = (props: DropzoneProps) => {
  const {
    accept,
    currFile,
    placeholder, 
    droppedFilename,
    onDrop
  } = props;
  const { getRootProps, getInputProps, isDragActive, isDragReject, acceptedFiles } = useDropzone({
    maxFiles: 1,
    onDrop: onDrop
  });
  return (
    <Center
      borderRadius='5px'
      borderWidth='1px'
      h='100px'
      _hover={{
        cursor: 'pointer',
      }}
      {...getRootProps({ className: 'dropzone' })}
    >
      <input type='file' {...getInputProps()} accept={accept} />
      <VStack>
        <ArrowUpIcon boxSize={6} />
        {isDragActive && 
          <Text className='dropzone-content'>
            Release to drop the files here
          </Text>
        }
        { !isDragActive && !currFile &&
          <Text className='dropzone-content'>
            { placeholder }
          </Text>
        }
        { !isDragActive && currFile &&
          <Text className='dropzone-content'>
            { droppedFilename }
          </Text>
        }
      </VStack>
    </Center>
  );
};

export default Dropzone;