import { MemoryRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ChakraProvider, Container, Flex, Tooltip } from '@chakra-ui/react';
import { MoralisProvider } from 'react-moralis';
import { useEffect } from 'react';
import mixpanel from 'mixpanel-browser';
import Studio from 'renderer/pages/Studio';
import IconButton from 'renderer/components/Button/IconButton';
import Home from './pages/Home';
import { theme } from './styles/theme';
import NavHeader from './components/NavBar/NavHeader';
import NavFooter from './components/NavBar/NavFooter';
import Avatars from './pages/Collectibles';
import Settings from './pages/Settings';
import { NFTProvider } from './contexts/NFTContext';
import { SettingProvider } from './contexts/SettingContext';
import { AuthProvider } from './contexts/AuthContext';
import { mAppId, mpToken, mServerUrl } from './settings';
import './styles/globals.css';
import '../../assets/fonts/TWKLausannePan-300.woff2';
import '../../assets/fonts/Gustavo-Bold.woff2';
import '../../assets/fonts/ClashGrotesk-Semibold.woff2';
import '../../assets/fonts/PPMonumentExtended-Bold.woff2';
import settingsSvgIcon from '../../assets/img/settings.svg';
import { CanvasProvider } from './contexts/CanvasContext';
import { TrackingProvider } from './contexts/TrackingContext';
import { PreviewMediaProvider } from './contexts/PreviewMediaContext';
import { RecordingProvider } from './contexts/RecordingContext';
import { TextEditorProvider } from './contexts/TextEditorContext';
import UploadModel from './components/Modal/UploadModel';

export default function App() {
  useEffect(() => {
    mixpanel.init(mpToken, { ip: false });
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <MoralisProvider appId={mAppId} serverUrl={mServerUrl}>
        <AuthProvider>
          <NFTProvider>
            <RecordingProvider>
              <CanvasProvider>
                <TextEditorProvider>
                  <PreviewMediaProvider>
                    <SettingProvider>
                      <TrackingProvider>
                        <Router>
                          <NavHeader />
                          <Home />
                          <Container
                            maxW="container.lg"
                            mt={4}
                            pb="100px"
                            height="calc(100% - 500px)"
                            overflow="scroll"
                            css={{
                              '&::-webkit-scrollbar': {
                                display: 'none',
                              },
                            }}
                            pos="relative"
                          >
                            <Flex
                              ml="auto"
                              pos="absolute"
                              top={-1}
                              right={2}
                              display="flex"
                              justifyContent="center"
                              zIndex={99}
                            >
                              <Tooltip label="Upload model">
                                <UploadModel />
                              </Tooltip>
                              <Link to="/settings">
                                <IconButton icon={settingsSvgIcon} />
                              </Link>
                            </Flex>
                            <Routes>
                              <Route path="/" element={<Avatars />} />
                              <Route path="/studio" element={<Studio />} />
                              <Route path="/voice" element={<div />} />
                              <Route path="/settings" element={<Settings />} />
                            </Routes>
                          </Container>
                          <NavFooter />
                        </Router>
                      </TrackingProvider>
                    </SettingProvider>
                  </PreviewMediaProvider>
                </TextEditorProvider>
              </CanvasProvider>
            </RecordingProvider>
          </NFTProvider>
        </AuthProvider>
      </MoralisProvider>
    </ChakraProvider>
  );
}
