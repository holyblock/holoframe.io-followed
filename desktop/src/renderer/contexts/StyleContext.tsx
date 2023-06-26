import { createContext, useContext, useState } from 'react';

export interface StyleContextProps {
  darkEnabled: boolean;
  setDarkEnabled: (enabled: boolean) => void;
  size: string;
  setSize: (size: string) => void;
  selectDisplayMode: string;
  setSelectDisplayMode: (selectDisplay: string) => void;
}

const StyleContext = createContext<StyleContextProps | null>(null);

export const useStyle = () => {
  return useContext(StyleContext);
};

export const StyleProvider = ({ children }) => {
  const [darkEnabled, setDarkMode] = useState<boolean>(false);
  const [size, setNewSize] = useState<string>();
  const [selectDisplayMode, setSelectDisplay] = useState<string>();

  const setDarkEnabled = (enabled: boolean) => {
    setDarkMode(enabled);
  };

  const setSize = (newSize: string) => {
    setNewSize(newSize);
  };

  const setSelectDisplayMode = (selectDisplay: string) => {
    setSelectDisplay(selectDisplay);
  };

  const value = {
    darkEnabled,
    setDarkEnabled,
    size,
    setSize,
    selectDisplayMode,
    setSelectDisplayMode,
  };
  return (
    <StyleContext.Provider value={value}>{children}</StyleContext.Provider>
  );
};
