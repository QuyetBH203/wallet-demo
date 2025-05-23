import { useState, useEffect, useCallback } from 'react'

export const usePrivateKey = () => {
  const [privateKey, setPrivateKey] = useState<string | null>(null)

  useEffect(() => {
    const key = sessionStorage.getItem('unlockedPrivateKey')
    if (key) {
      setPrivateKey(key)
    }
  }, [])

  const clearPrivateKeyFromSession = useCallback(() => {
    sessionStorage.removeItem('unlockedPrivateKey')
    setPrivateKey(null)
  }, [])

  return { privateKey, clearPrivateKeyFromSession }
}
