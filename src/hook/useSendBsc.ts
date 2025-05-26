import { useCallback, useMemo } from 'react'
import { ethers, isAddress } from 'ethers'
import { BSC_RPC_URL } from '@/constants'
import { useWalletAddress } from './useWalletAddress'
import { RpcError } from 'viem'
import toast from 'react-hot-toast'

export const useSendBsc = () => {
  const { walletAddress } = useWalletAddress()

  // Create a JSON-RPC provider for BSC
  const provider = useMemo(() => new ethers.JsonRpcProvider(BSC_RPC_URL), [])

  /**
   * Send BNB to a recipient address.
   * @param recipientAddress the target address (0x...)
   * @param amount the amount in ether (e.g. "0.1")
   * @returns the transaction response
   */
  const sendToken = useCallback(
    async (recipientAddress: string, amount: string) => {
      try {
        if (!walletAddress) {
          throw new Error('Wallet address not available')
        }

        if (!isAddress(recipientAddress)) {
          throw new Error('Invalid recipient address')
        }

        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
          throw new Error('Invalid amount')
        }

        // Get private key from a more secure storage (consider using a secure vault)
        const privateKey = sessionStorage.getItem('unlockedPrivateKey')
        if (!privateKey) {
          throw new Error('No private key found. Please authenticate first.')
        }

        // Create signer
        const signer = new ethers.Wallet(privateKey, provider)

        // Validate balance
        const balance = await provider.getBalance(walletAddress)
        const amountInWei = ethers.parseEther(amount)
        if (balance < amountInWei) {
          throw new Error('Insufficient balance')
        }

        // Estimate gas
        const gasPrice = await provider.getFeeData()
        const gasLimit = 21000 // Standard gas limit for simple transfers

        // Prepare and send transaction
        const tx = await signer.sendTransaction({
          to: recipientAddress,
          value: amountInWei,
          gasLimit,
          gasPrice: gasPrice.gasPrice
        })

        // Wait for transaction confirmation
        const receipt = await provider.waitForTransaction(tx.hash, 1, 60000) // 60s timeout
        if (receipt?.status === 0) {
          throw new Error('Transaction failed')
        }

        toast.success(`Transaction successful: ${tx.hash}`)
        return receipt?.status
      } catch (error) {
        const err = error as RpcError
        const errorMessage = err.shortMessage || err.message || 'Unknown error'
        toast.error(`Failed to send BNB: ${errorMessage}`)
        console.error('Transaction error:', error)
        return null
      }
    },
    [provider, walletAddress]
  )
  return { sendToken }
}
