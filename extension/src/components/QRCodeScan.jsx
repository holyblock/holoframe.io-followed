import axios from "axios";
import React, { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { v4 as uuidv4 } from "uuid";
import { Box, Heading, Flex, Text, Stack } from "@chakra-ui/react";
import Button from "../components/Button";
import { useAuth } from "../contexts/AuthContext";
import config from "../config/constants";

const TokenproofIcon = () => {
  return (
    <svg
      width="96"
      height="101"
      viewBox="0 0 96 101"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.10961 45.4148C6.03044 45.4386 2.96342 45.0284 0 44.1963L2.05862 37.731C2.16697 37.731 13.2935 41.0465 22.5531 34.6309C30.8376 28.8868 35.3883 17.2326 36.1967 0L43.006 0.314977C42.0892 19.8104 36.4968 33.2467 26.337 40.2425C21.253 43.693 15.2223 45.4992 9.06793 45.4148"
        fill="currentColor"
      />
      <path
        d="M86.503 45.4148C80.3486 45.4992 74.3179 43.693 69.2339 40.2425C59.1158 33.2467 53.5234 19.8104 52.6066 0.314977L59.4159 0C60.2493 17.2326 64.8166 28.8868 73.0594 34.6309C82.3191 41.088 93.4456 37.7641 93.554 37.731L95.6126 44.1963C92.6492 45.0284 89.5821 45.4386 86.503 45.4148Z"
        fill="currentColor"
      />
      <path
        d="M59.4159 101L52.6066 100.685C53.5234 81.231 59.1158 67.7533 69.2339 60.7575C81.2856 52.4106 95.0708 56.613 95.6126 56.8037L93.554 63.269C93.4456 63.269 82.3191 59.9534 73.0594 66.369C64.8166 72.1132 60.2326 83.7757 59.4159 101Z"
        fill="currentColor"
      />
      <path
        d="M36.1967 101C35.3799 83.7672 30.8376 72.113 22.5531 66.3688C13.3352 59.9118 2.16697 63.2356 2.05862 63.2688L0 56.8035C0.57508 56.6211 14.327 52.4104 26.3787 60.7573C36.4968 67.7531 42.0892 81.2308 43.006 100.685L36.1967 101Z"
        fill="currentColor"
      />
    </svg>
  );
};

const ScanResult = ({ session, onSuccess, onRegenerate }) => {
  const { status } = session;
  const isAuthenticated = status === "authenticated";
  const isExpired = status === "expired_session";

  useEffect(() => {
    if (status === "authenticated") {
      setTimeout(() => {
        onSuccess(session);
      }, 1000);
    }
  }, [status]);

  return (
    <Stack w="220px" direction="column" spacing={2}>
      <Stack
        borderRadius={4}
        bg={
          isAuthenticated
            ? "green.400"
            : isExpired
            ? "blackAlpha.400"
            : "red.400"
        }
        direction="column"
        justify="space-evenly"
        align="center"
        width="220px"
        height="220px"
      >
        <Text fontSize="md" fontWeight={600}>
          {isAuthenticated
            ? "tokenproof Approved"
            : isExpired
            ? "Time Out"
            : "Denied"}
        </Text>
        <Box mx="auto" my={5}>
          <TokenproofIcon />
        </Box>
        <Text fontSize="sm">
          {isAuthenticated
            ? "You are all set!"
            : isExpired
            ? "QR Code Expired"
            : "Requirements not met"}
        </Text>
      </Stack>
      {!isAuthenticated && (
        <Button
          color="transparent"
          variant="outline"
          text="Regenerate QR Code"
          onClick={onRegenerate}
        />
      )}
    </Stack>
  );
};

const QRCodeScan = ({ onBack, showError }) => {
  const { tokenproofSession, setTokenproofSession, loginTokenproof, logout } =
    useAuth();
  const { sendMessage, lastMessage } = useWebSocket(config.wssUrl);

  const handleSuccess = async (session) => {
    await logout();
    await loginTokenproof(session);
  }

  const handleGenerate = () => {
    setImgData(null);
    const nonce = uuidv4();
    sendMessage(
      JSON.stringify({
        type: "ack-nonce",
        data: {
          nonce,
        },
      })
    );
    axios.post(`${config.apiUrl}/auth/tokenproof`, { nonce }).then((res) => {
      const { qrcode_image, ttl } = res.data;
      setImgData(qrcode_image);
    });
  };

  useEffect(() => {
    handleGenerate();
  }, []);

  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const { type, data } = JSON.parse(lastMessage.data);
        if (type === "auth") {
          setTokenproofSession(data);
        }
      } catch (err) {
        console.log(err);
      }
    }
  }, [lastMessage]);

  const [imgData, setImgData] = useState();

  return (
    <Flex
      h="100%"
      w="100%"
      flexDir="column"
      justifyContent="space-between"
      alignItems="center"
    >
      <Heading as="h1" size="md" mt={2}>
        Scan QR Code
      </Heading>
      <Box py={4} minHeight="260px">
        {!tokenproofSession ? (
          imgData && <img src={imgData} alt="qrcode" />
        ) : (
          <ScanResult
            session={tokenproofSession}
            onSuccess={handleSuccess}
            onRegenerate={handleGenerate}
          />
        )}
      </Box>
    </Flex>
  );
};

export default QRCodeScan;
