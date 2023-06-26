import { createContext, useContext, useState } from 'react';
import CanvasText from 'renderer/utils/canvasText';

export interface TextEditorContextProps {
  showEditorModal: boolean;
  setShowEditorModal: (value: boolean) => void;
  currentText: CanvasText;
  setCurrentText: (value: CanvasText) => void;
}

const TextEditorContext = createContext<TextEditorContextProps | null>(null);

export const useTextEditor = () => {
  return useContext(TextEditorContext);
};

export const TextEditorProvider = ({ children }) => {
  const [showEditorModal, setShowEditorModal] = useState<boolean>(false);
  const [currentText, setCurrentText] = useState<CanvasText>();
  const value = {
    showEditorModal,
    setShowEditorModal,
    currentText,
    setCurrentText,
  };
  return (
    <TextEditorContext.Provider value={value}>
      {children}
    </TextEditorContext.Provider>
  );
};
