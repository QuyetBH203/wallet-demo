import { ethers } from 'ethers'
import { useWalletAddress } from './useWalletAddress'
import { BSC_RPC_URL } from '@/constants'
import toast from 'react-hot-toast'
import { useCallback, useMemo } from 'react'
import type { RpcError } from 'viem'
import { erc20Abi, parseUnits } from 'viem'

export const useSendTokenErc20 = () => {
  const { walletAddress } = useWalletAddress()
  const provider = useMemo(() => new ethers.JsonRpcProvider(BSC_RPC_URL), [])

  const sendTokenErc20 = useCallback(
    async (recipientAddress: string, amount: string, tokenAddress: string) => {
      try {
        if (!walletAddress) {
          throw new Error('No wallet address available')
        }

        const privateKey = sessionStorage.getItem('unlockedPrivateKey')
        if (!privateKey) {
          throw new Error('No unlocked private key found. Please login or reveal your key first.')
        }
        // Create a signer with the private key and BSC provider
        const signer = new ethers.Wallet(privateKey, provider)
        const contract = new ethers.Contract(tokenAddress, erc20Abi, signer)
        const balance = await contract.balanceOf(walletAddress)
        const amountInWei = parseUnits(amount, 18)

        if (balance < amountInWei) {
          throw new Error('Insufficient token balance')
        }
        const tx = await contract.transfer(recipientAddress, amountInWei)
        const receipt = await tx.wait()

        toast.success(`Transaction successful: ${tx.hash}`)
        return receipt
      } catch (error) {
        toast.error('Failed to send token: ' + (error as RpcError)?.shortMessage || 'Unknown error')
        console.log('Error in send token:', error)
        return null
      }
    },
    [walletAddress, provider]
  )
  return { sendTokenErc20 }
}
