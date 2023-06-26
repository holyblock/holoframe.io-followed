import React, { createContext, useContext, useState } from "react";

export const NFTGridContext = createContext(null);

export const NFTGridProvider = ({ children }) => {
  const [selectedHologram, setSelectedHologram] = useState();
  const [selectedBackground, setSelectedBackground] = useState();

  return (
    <NFTGridContext.Provider
      value={{
        selectedHologram,
        setSelectedHologram,
        selectedBackground,
        setSelectedBackground,
      }}
    >
      {children}
    </NFTGridContext.Provider>
  );
};

export const useNFTGrid = () => useContext(NFTGridContext);

export default NFTGridProvider;
