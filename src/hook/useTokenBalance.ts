import { BSC_RPC_URL } from '@/constants'
import { useEffect, useMemo, useState } from 'react'
import { useWalletAddress } from './useWalletAddress'
import { ethers } from 'ethers'
import { erc20Abi, formatUnits } from 'viem'

export const useTokenErc20Balance = (mint: string) => {
  const { walletAddress } = useWalletAddress()
  const provider = useMemo(() => new ethers.JsonRpcProvider(BSC_RPC_URL), [])
  const [balance, setBalance] = useState<string | null>(null)
  const [refetch, setRefetch] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      try {
        if (!walletAddress || !mint) return
        const signer = await provider.getSigner()
        const tokenContract = new ethers.Contract(mint, erc20Abi, signer)
        const rawBalance = await tokenContract.balanceOf(walletAddress)
        setBalance(formatUnits(rawBalance, 18))
      } catch (error) {
        console.log('Error getting token balance:', error)
      }
    })()
  }, [walletAddress, mint, refetch, provider])

  const refetchBalance = () => {
    setRefetch((prev) => !prev)
  }

  return { balance, refetchBalance }
}
