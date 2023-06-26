import { BaseProvider } from "@ethersproject/providers";
import { GetAccountResult } from "@wagmi/core";
import localforage from "localforage";
import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAccount, useDisconnect, useNetwork } from "wagmi";

type ITokenproofSession = {
  account: string;
  nonce: string;
  session_id: string;
  status: "authenticated" | "expired_session";
  isConnected: boolean;
  timestamp: string;
};

export const AuthContext = createContext<{
  tokenproofSession?: ITokenproofSession;
  wagmiAccountData?: GetAccountResult<BaseProvider>;
  address?: string;
  chainID: number;
  setTokenproofSession?: Dispatch<
    SetStateAction<ITokenproofSession | undefined>
  >;
  isConnected: boolean;
  logout: () => void;
} | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [tokenproofSession, setTokenproofSession] =
    useState<ITokenproofSession>();
  const [isConnected, setIsConnected] = useState(false);
  const data = useAccount();
  const { chain } = useNetwork();
  const [chainID, setChainID] = useState(chain?.id ?? 1);
  const { disconnect } = useDisconnect();

  useEffect(() => {
    const loadSession = async () => {
      const session = await localforage.getItem("tokenproofSession");
      if (session) {
        setTokenproofSession(session as ITokenproofSession);
      }
    };

    loadSession();
  }, []);

  useEffect(() => {
    const connected = (data?.isConnected || tokenproofSession?.status === 'authenticated') ?? false;
    setIsConnected(connected);
  }, [data, data?.isConnected, tokenproofSession]);

  useEffect(() => {
    setChainID(chain?.id ?? 1);
  }, [chain]);

  const logout = async () => {
    disconnect();

    // Remove tokenproof session
    setTokenproofSession(undefined);
    await localforage.removeItem("tokenproofSession");
    await localforage.removeItem("web3Provider");
  };

  return (
    <AuthContext.Provider
      value={{
        tokenproofSession,
        wagmiAccountData: data,
        address: tokenproofSession?.account || data?.address,
        chainID,
        setTokenproofSession,
        isConnected,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("You forgot to use AuthProvider");
  }

  return context;
};

export default AuthProvider;
