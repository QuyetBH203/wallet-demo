import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { ethers } from 'ethers'
import PrivateKeyDialog from './pages/transaction-page/private-key'
import { useWalletAddress } from '@/hook/useWalletAddress'

export default function TransactionPage() {
  const { walletAddress, error } = useWalletAddress()
  const [showPrivateKeyDialog, setShowPrivateKeyDialog] = useState(false)
  const [passwordForPrivateKey, setPasswordForPrivateKey] = useState('')
  const [decryptedPrivateKey, setDecryptedPrivateKey] = useState<string | null>(null)
  const [privateKeyError, setPrivateKeyError] = useState<string | null>(null)
  const [isRevealingPk, setIsRevealingPk] = useState(false)

  const holdTimer = useRef<NodeJS.Timeout | null>(null)
  const HOLD_DURATION = 3000

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
