import { useRef } from "react";
import { Fade, useDisclosure, Box } from "@chakra-ui/react";

import ConnectWallet from "../../components/Modal/ConnectWallet";
import AppNavigationBar from "../../components/NavigationBar/AppNavigationBar";
import AppFooter from "../../components/NavigationFooter/AppFooter";
import Banner from "../../components/WorldCup/Banner";
import About from "../../components/WorldCup/About"
import Pool from "../../components/WorldCup/Pool";
import WCHomeProvider from "../../contexts/WCHomeContext";
import Mint from "../../components/WorldCup/Mint";
import Instructions from "../../components/WorldCup/Instructions";
import FAQs from "../../components/WorldCup/FAQs";
import WCAwayProvider from "../../contexts/WCAwayContext";

const HoloWorldCup = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const aboutRef = useRef<any>();
  const mintRef = useRef<any>();
  const playRef = useRef<any>();
  const faqsRef = useRef<any>();

  return (
    <Fade in>
      <AppNavigationBar />
      <WCHomeProvider>
        <WCAwayProvider>
        <Banner
          aboutRef={aboutRef}
          mintRef={mintRef}
          playRef={playRef}
          faqsRef={faqsRef}
        />
          <Box ref={aboutRef}>
            <About />
          </Box>
          <Box ref={mintRef}>
            <Mint />
          </Box>
          <Box ref={playRef}>
            <Pool />
            <Instructions />
          </Box>
          <Box ref={faqsRef}>
            <FAQs />
          </Box>
        </WCAwayProvider>
      </WCHomeProvider>
      <AppFooter />
      <ConnectWallet isOpen={isOpen} onClose={onClose} />
    </Fade>
  );
};

export default HoloWorldCup;
