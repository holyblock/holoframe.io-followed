
import React from 'react';
import localforage from 'localforage';
import { useEffect, createContext, useContext, useState } from 'react';

export interface SettingContextProps {
  hologramEnabled: boolean;
  devices: MediaDeviceInfo[];
  selectedDeviceID: string;
  setHologramEnabled: (enabled: boolean) => void;
  updateDevices: (newDevices: MediaDeviceInfo[]) => void;
  selectDeviceID: (deviceID: string) => void;
}

const SettingContext = createContext<SettingContextProps | null>(null);

export const useSetting = () => {
  return useContext(SettingContext);
};

export const SettingProvider = ({ children }: any) => {
  const [hologramEnabled, setHologramEnabled] = useState(true);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceID, setSelectedDeviceID] = useState<string>('');

  useEffect(() => {
    (async () => {
      // Get list of devices available
      const currDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = currDevices.filter(
        (d) => d.kind === 'videoinput' && !d.label.includes('Hologram Camera')
      );
      setDevices(videoDevices);

      // Set selected device
      const cachedVideoDeviceID: string = await localforage.getItem(
        'videoDeviceID'
      );
      if (cachedVideoDeviceID) {
        setSelectedDeviceID(cachedVideoDeviceID);
      } else {
        const currDeviceIDs = videoDevices.map((d) => d.deviceId);
        setSelectedDeviceID(currDeviceIDs[0]);
      }
    })();
  }, []);

  const updateDevices = (newDevices: MediaDeviceInfo[]) => {
    setDevices(newDevices);
  };

  const selectDeviceID = (deviceID: string) => {
    setSelectedDeviceID(deviceID);
    localforage.setItem('videoDeviceID', deviceID);
  };

  const value = {
    hologramEnabled,
    devices,
    selectedDeviceID,
    setHologramEnabled,
    updateDevices,
    selectDeviceID,
  };
  return (
    <SettingContext.Provider value={value}>{children}</SettingContext.Provider>
  );
};
