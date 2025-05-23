import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React from 'react'

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

export default PrivateKeyDialog
