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
        const privateKey = sessionStorage.getItem('unlockedPrivateKey')
        if (!privateKey) {
          throw new Error('No unlocked private key found. Please login or reveal your key first.')
        }
        const signer = new ethers.Wallet(privateKey, provider)
        const tokenContract = new ethers.Contract(mint, erc20Abi, signer)
        const rawBalance = await tokenContract.balanceOf(`0x${walletAddress}`)
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
