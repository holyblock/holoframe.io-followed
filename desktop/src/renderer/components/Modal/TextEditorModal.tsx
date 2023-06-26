import { Button, Heading, Textarea } from '@chakra-ui/react';
import { useState } from 'react';
import Modal from 'renderer/components/Modal';
import { useTextEditor } from 'renderer/contexts/TextEditorContext';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const TextEditorModal = ({ isOpen, onClose }: Props) => {
  const { setShowEditorModal, currentText } = useTextEditor();

  const [text, setText] = useState<string>(currentText?.getText() ?? '');

  const handleUpdate = () => {
    currentText.updateText(text);
    setShowEditorModal(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      header={
        <Heading mb={2} textAlign="center" size="md">
          Text Editor
        </Heading>
      }
    >
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
      />
      <Button onClick={handleUpdate} mt={4}>
        Update
      </Button>
    </Modal>
  );
};

export default TextEditorModal;
