import React, { useState, useEffect } from 'react';
import config from '../../../utils/config';

const useDomainSupported = () => {
  const [domainSupported, setDomainSupported] = useState(false);
  const [done, setDone] = useState(false);
  // Initialize listener for getting all expressions
  useEffect(() => {
    // Check if current domain is supported for extension
    chrome.tabs.query({ active: true }, tabs => {
      for (const tab of tabs) {
        const url = tab.url;
        for (const platformURL of config.extension.platforms.supportedUrls) {
          if (url.includes(platformURL)) {
            setDomainSupported(true);
            return setDone(true);
          }
        }
      }
    });
    setDone(true);
  }, []);

  return { domainSupported, done };
};

export default useDomainSupported;