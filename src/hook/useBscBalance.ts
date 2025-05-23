import { useState, useEffect, useMemo, useCallback } from 'react'
import { ethers } from 'ethers'
import { BSC_RPC_URL } from '@/constants'

export const useBscBalance = (address: string): { balance: string | null; refetch: () => void } => {
  const [balance, setBalance] = useState<string | null>(null)
  // Create provider once
  const provider = useMemo(() => new ethers.JsonRpcProvider(BSC_RPC_URL), [])

  // Function to update balance
  const updateBalance = useCallback(async () => {
    if (!address) {
      setBalance(null)
      return
    }
    try {
      const rawBalance = await provider.getBalance(`0x${address.trim()}`)
      setBalance(ethers.formatEther(rawBalance))
    } catch (error) {
      console.error('Error fetching balance:', error)
      setBalance(null)
    }
  }, [address, provider])

  // Subscribe to new blocks to refresh balance
  useEffect(() => {
    updateBalance()
    provider.on('block', updateBalance)
    return () => {
      provider.off('block', updateBalance)
    }
  }, [provider, updateBalance])

  return { balance, refetch: updateBalance }
}
