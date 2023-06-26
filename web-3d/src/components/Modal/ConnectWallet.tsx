import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Modal, ModalOverlay } from '@chakra-ui/react'
import { Connector, useConnect } from 'wagmi'
import QRCodeScan from './QRCodeScan'
import { CloseIcon } from '../Icons/CloseIcon'
import classNames from 'classnames'

// Allows user to select the wallet they want to login with
const ConnectWallet = ({ isOpen, onClose }) => {
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect()

  const [tokenproofSelected, setTokenproofSelected] = useState(false)

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setTokenproofSelected(false)
        onClose()
      }}
      isCentered
      size='md'
    >
      <ModalOverlay />
      <div className='absolute pt-8 pb-12 border max-w-[550px] bg-firefly border-denim-blue/[.15] z-[2000] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-9'>
        <div className='text-right'>
          <button type='button' onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className='text-xl font-bold text-center text-white'>
          CONNECT YOUR WALLET
        </div>
        <div className='mt-5 text-xs font-light text-center text-white'>
          Sign in to use your NFTs in one click. We never have access to any of
          your data or funds.
        </div>
        <div className='w-full mt-10'>
          {tokenproofSelected ? (
            <QRCodeScan onSuccess={onClose} />
          ) : (
            <div className='flex flex-col gap-3'>
              {connectors.map((connector: Connector) => (
                <button
                  key={connector.id}
                  className='relative flex items-center justify-center w-full py-4 text-center text-white border bg-dark-turquoise/[.12] border-denim-blue/[.15] shadow-sm shadow-astronaut-blue/[.25]'
                  disabled={!connector.ready}
                  onClick={async () => {
                    connect({ connector })
                    onClose()
                  }}
                >
                  <Image
                    width={30}
                    height={30}
                    src={`/${connector.name}.svg`}
                    alt='metamask'
                  />
                  <span className='ml-4 font-semibold'>
                    {connector.name}
                    {!connector.ready && ' (unsupported)'}
                    {isLoading &&
                      connector.id === pendingConnector?.id &&
                      ' (connecting)'}
                  </span>
                  <div
                    className={classNames({
                      'absolute bottom-0 left-0 w-full h-[2px]': true,
                      'bg-metamask-glow-bar':
                        connector.name.toLowerCase() === 'metamask',
                      'bg-walletconnect-glow-bar':
                        connector.name.toLowerCase() === 'walletconnect',
                    })}
                  />
                </button>
              ))}
              <button
                className='relative flex items-center justify-center w-full py-4 text-center text-white border bg-dark-turquoise/[.12] border-denim-blue/[.15] shadow-sm shadow-astronaut-blue/[.25]'
                onClick={() => setTokenproofSelected(true)}
              >
                <Image
                  width={30}
                  height={30}
                  src='/tokenproof.svg'
                  alt='tokenproof'
                />
                <span className='ml-4 font-semibold'>Tokenproof</span>
                <div className='absolute bottom-0 left-0 w-full h-[2px] bg-tokenproof-glow-bar' />
              </button>
            </div>
          )}
        </div>
        <div className='w-full mt-12'>
          {tokenproofSelected ? (
            <button
              className='w-full py-4 font-bold text-center text-white uppercase border border-denim-blue/[.15] bg-almost-black/[.25]'
              onClick={() => setTokenproofSelected(false)}
            >
              Back
            </button>
          ) : (
            <button
              className='w-full py-4 font-bold text-center text-white uppercase border border-denim-blue/[.15] bg-almost-black/[.25]'
              onClick={onClose}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default ConnectWallet
