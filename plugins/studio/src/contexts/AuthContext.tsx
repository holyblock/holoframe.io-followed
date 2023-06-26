import React, { useContext, useState } from 'react';

const AuthContext = React.createContext<AuthContextProps | null>(null);

export interface AuthContextProps {
  userAddress: string;
  setUserAddress: (userAddress: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  warning: string;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [userAddress, _setUserAddress] = useState('');
  const [isAuthenticated, _setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState('');

  const setUserAddress = (addr: string) => {
    _setUserAddress(addr);
  };

  const setIsAuthenticated = async (authenticated: boolean) => {
    _setIsAuthenticated(authenticated);
  };

  const value = {
    userAddress,
    setUserAddress,
    isAuthenticated,
    setIsAuthenticated,
    warning,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
