import { useEffect, useState } from 'react'

export const useWalletAddress = () => {
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
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
  return { walletAddress, setWalletAddress, error }
}
