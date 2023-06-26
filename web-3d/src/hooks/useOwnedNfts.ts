import { OwnedNFT } from '@/types'
import { useState, useEffect } from 'react'
import { ALCHEMY_NETWORK_MAP } from '@/utils/web3Config'
import axios from 'axios'
import { useAuth } from '@/contexts/AuthContext'
import { aApiKey } from 'settings'

export default function useOwnedNfts() {
  const [nfts, setNfts] = useState<OwnedNFT[]>()
  const { address, chainId } = useAuth()

  const fetchNFTs = async () => {
    if (!address || !chainId) return

    const owner = address

    let pageKey = ''
    const network = ALCHEMY_NETWORK_MAP[chainId]
    const baseUrl = `https://${network}.g.alchemy.com`
    const nfts: OwnedNFT[] = []

    while (true) {
      const { data } = await axios.get<{
        ownedNfts: OwnedNFT[]
        pageKey: string
      }>(`${baseUrl}/nft/v2/${aApiKey}/getNFTs`, {
        params: {
          owner,
          pageKey,
          pageSize: 100,
        },
      })

      nfts.push(...data.ownedNfts)

      if (data.pageKey) {
        pageKey = data.pageKey
      } else {
        break
      }
    }

    setNfts(nfts)
  }

  useEffect(() => {
    if (address) {
      fetchNFTs()
    }
  }, [address])

  return nfts
}
