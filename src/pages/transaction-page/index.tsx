import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ethers } from 'ethers'

const PrivateKeyDialog = React.memo(
  ({
    passwordForPrivateKey,
    setPasswordForPrivateKey,
    decryptedPrivateKey,
    privateKeyError,
    isRevealingPk,
    handleRevealPrivateKey,
    closePrivateKeyDialog,
    navigator
  }: {
    passwordForPrivateKey: string
    setPasswordForPrivateKey: (value: string) => void
    decryptedPrivateKey: string | null
    privateKeyError: string | null
    isRevealingPk: boolean
    handleRevealPrivateKey: () => Promise<void>
    closePrivateKeyDialog: () => void
    navigator: Navigator
  }) => {
    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
        <div className='bg-white p-6 rounded-lg shadow-xl max-w-md w-full'>
          <h3 className='text-xl font-bold mb-4 text-red-600'>DANGER: Private Key</h3>
          {!decryptedPrivateKey ? (
            <>
              <p className='text-sm mb-3 text-gray-700'>
                To reveal your private key, please enter your wallet password. This key gives full control over your
                funds. <strong className='text-red-500'>NEVER share it with anyone.</strong>
              </p>
              <Input
                type='password'
                placeholder='Enter wallet password'
                value={passwordForPrivateKey}
                onChange={(e) => setPasswordForPrivateKey(e.target.value)}
                className='w-full mb-3 border-black'
              />
              {privateKeyError && <p className='text-red-500 text-xs mb-3'>{privateKeyError}</p>}
              <Button
                onClick={handleRevealPrivateKey}
                className='w-full bg-red-600 hover:bg-red-700 text-white'
                disabled={isRevealingPk}
              >
                {isRevealingPk ? 'Revealing...' : 'Reveal Private Key'}
              </Button>
            </>
          ) : (
            <>
              <p className='text-sm text-red-600 mb-2'>
                <strong>
                  WARNING: Your Private Key is shown below. Copy it and store it securely offline. Close this dialog
                  immediately after.
                </strong>
              </p>
              <p
                className='font-mono text-xs bg-gray-100 p-3 rounded break-all cursor-pointer hover:bg-gray-200 mb-4'
                onClick={() => navigator.clipboard.writeText(decryptedPrivateKey || '')}
                title='Click to copy private key'
              >
                {decryptedPrivateKey}
              </p>
              <p className='text-xs text-gray-500 mt-1 text-center'>Click the key to copy.</p>
            </>
          )}
          <Button onClick={closePrivateKeyDialog} className='w-full mt-4 bg-gray-300 hover:bg-gray-400 text-black'>
            Close
          </Button>
        </div>
      </div>
    )
  }
)

export default function TransactionPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPrivateKeyDialog, setShowPrivateKeyDialog] = useState(false)
  const [passwordForPrivateKey, setPasswordForPrivateKey] = useState('')
  const [decryptedPrivateKey, setDecryptedPrivateKey] = useState<string | null>(null)
  const [privateKeyError, setPrivateKeyError] = useState<string | null>(null)
  const [isRevealingPk, setIsRevealingPk] = useState(false)

  const holdTimer = useRef<NodeJS.Timeout | null>(null)
  const HOLD_DURATION = 3000

  useEffect(() => {
    const fetchWalletAddress = async () => {
      if (chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['walletKeystore'], (result) => {
          if (chrome.runtime.lastError) {
            console.error('Error fetching keystore:', chrome.runtime.lastError.message)
            setError('Could not load wallet data. ')
            return
          }
          const keystoreJson = result.walletKeystore
          if (keystoreJson) {
            try {
              const keystore = JSON.parse(keystoreJson)
              if (keystore && keystore.address) {
                setWalletAddress(keystore.address)
              } else {
                console.warn('Address not found directly in keystore object:', keystore)
                setError('Address not found in wallet data. The keystore might be in an unexpected format or version.')
              }
            } catch (parseError) {
              console.error('Error parsing keystore JSON:', parseError)
              setError('Could not parse wallet data.')
            }
          } else {
            setError('No wallet found. Please create or import a wallet first.')
          }
        })
      } else {
        const keystoreJson = localStorage.getItem('walletKeystore')
        if (keystoreJson) {
          try {
            const keystore = JSON.parse(keystoreJson)
            if (keystore && keystore.address) {
              setWalletAddress(keystore.address)
            } else {
              setError('Address not found in wallet data (localStorage).')
            }
          } catch (parseError) {
            console.error('Error parsing keystore JSON (localStorage):', parseError)
            setError('Could not parse wallet data (localStorage).')
          }
        } else {
          setError('No wallet found (localStorage). Please create or import a wallet first.')
        }
        console.warn('chrome.storage.local not available, attempting to use localStorage.')
      }
    }

    fetchWalletAddress()
  }, [])

  const handleMouseDownShowPk = useCallback(() => {
    alert(
      'DANGER: You are attempting to reveal your private key. Continue holding if you understand the risks and wish to proceed. NEVER share this key.'
    )
    holdTimer.current = setTimeout(() => {
      setShowPrivateKeyDialog(true)
    }, HOLD_DURATION)
  }, [])

  const handleMouseUpShowPk = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current)
      holdTimer.current = null
    }
  }, [])

  const handleRevealPrivateKeyInternal = useCallback(async () => {
    if (!passwordForPrivateKey) {
      setPrivateKeyError('Password is required to reveal private key.')
      return
    }
    setPrivateKeyError(null)
    setIsRevealingPk(true)

    try {
      const getFromStorage = (key: string): Promise<string | null> =>
        new Promise((resolve) => {
          if (chrome && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get([key], (result) => {
              resolve(result[key] as string | null)
            })
          } else {
            resolve(localStorage.getItem(key))
          }
        })

      const encryptedKeystoreJson = await getFromStorage('walletKeystore')
      if (!encryptedKeystoreJson) {
        setPrivateKeyError('Wallet keystore not found.')
        setIsRevealingPk(false)
        return
      }

      const decryptedWallet = await ethers.Wallet.fromEncryptedJson(encryptedKeystoreJson, passwordForPrivateKey)
      setDecryptedPrivateKey(decryptedWallet.privateKey)
    } catch (e) {
      console.error('Failed to decrypt wallet for PK:', e)
      if (
        e instanceof Error &&
        (e.message.toLowerCase().includes('invalid password') || e.message.toLowerCase().includes('bad password'))
      ) {
        setPrivateKeyError('Invalid password.')
      } else {
        setPrivateKeyError('Failed to decrypt wallet. Check password or keystore.')
      }
      setDecryptedPrivateKey(null)
    }
    setIsRevealingPk(false)
  }, [passwordForPrivateKey])

  const closePrivateKeyDialogInternal = useCallback(() => {
    setShowPrivateKeyDialog(false)
    setPasswordForPrivateKey('')
    setDecryptedPrivateKey(null)
    setPrivateKeyError(null)
    setIsRevealingPk(false)
  }, [])

  return (
    <div className='flex flex-col items-center justify-start h-full p-4 gap-4 pt-10'>
      <h1 className='text-3xl font-bold mb-2'>Home Page</h1>
      <div className='mb-4'>
        <Button
          variant='destructive'
          className='bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5'
          onMouseDown={handleMouseDownShowPk}
          onMouseUp={handleMouseUpShowPk}
          onTouchStart={handleMouseDownShowPk}
          onTouchEnd={handleMouseUpShowPk}
          title='Press and HOLD for 3 seconds to start revealing private key'
        >
          Show Private Key (Hold)
        </Button>
      </div>

      {error && (
        <div className='text-red-500 bg-red-100 border border-red-400 p-3 rounded w-full max-w-md text-center'>
          <p>
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {walletAddress && (
        <div className='w-full max-w-lg p-4 bg-gray-50 border border-gray-300 rounded-lg shadow'>
          <h2 className='text-xl font-semibold mb-3 text-gray-700'>Your Wallet Address:</h2>
          <p
            className='font-mono text-sm bg-gray-200 p-3 rounded break-all cursor-pointer hover:bg-gray-300'
            onClick={() => walletAddress && navigator.clipboard.writeText(walletAddress)}
            title='Click to copy address'
          >
            {walletAddress}
          </p>
          <p className='text-xs text-gray-500 mt-2 text-center'>Click the address to copy it.</p>
        </div>
      )}

      {!walletAddress && !error && <p>Loading wallet address...</p>}

      <div className='mt-8 w-full max-w-lg'>
        <h2 className='text-xl font-semibold mb-3 text-gray-700'>Action:</h2>
        <div className=' flex flex-row justify-between'>
          <Button variant='outline' className='bg-orange-500 border-2 border-black'>
            Send
          </Button>
          <Button variant='outline' className='bg-orange-500 border-2 border-black'>
            Receive
          </Button>
        </div>
      </div>

      {showPrivateKeyDialog && (
        <PrivateKeyDialog
          passwordForPrivateKey={passwordForPrivateKey}
          setPasswordForPrivateKey={setPasswordForPrivateKey}
          decryptedPrivateKey={decryptedPrivateKey}
          privateKeyError={privateKeyError}
          isRevealingPk={isRevealingPk}
          handleRevealPrivateKey={handleRevealPrivateKeyInternal}
          closePrivateKeyDialog={closePrivateKeyDialogInternal}
          navigator={window.navigator}
        />
      )}
    </div>
  )
}
