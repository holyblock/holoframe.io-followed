import localforage from 'localforage'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAccount, useDisconnect, useNetwork } from 'wagmi'

const AuthContext = createContext(null)

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const { chain } = useNetwork()
  const { address: wagmiAddress } = useAccount()
  const { disconnect } = useDisconnect()
  const [tokenproofSession, setTokenproofSession] = useState<any>()

  const logout = async () => {
    if (tokenproofSession) {
      setTokenproofSession(undefined)
      await localStorage.removeItem('tokenproofSession')
    } else {
      disconnect()
    }
  }

  const chainId = useMemo(() => {
    if (chain) {
      return chain.id
    }
    if (tokenproofSession) {
      return 1
    }
    return undefined
  }, [chain, tokenproofSession])

  const address = useMemo(() => {
    if (wagmiAddress) {
      return wagmiAddress
    }
    if (tokenproofSession) {
      return tokenproofSession.account
    }
    return undefined
  }, [wagmiAddress, tokenproofSession])

  useEffect(() => {
    ;(async () => {
      const session = await localforage.getItem('tokenproofSession')
      if (session) {
        setTokenproofSession(session)
      }
    })()
  }, [])

  const value = {
    chainId,
    address,
    isAuthenticated: !!wagmiAddress || !!tokenproofSession,
    tokenproofSession,
    setTokenproofSession,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
