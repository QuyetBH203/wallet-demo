import { useCallback, useMemo } from 'react'
import { ethers } from 'ethers'
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
          throw new Error('No wallet address available')
        }

        const privateKey = sessionStorage.getItem('unlockedPrivateKey')
        if (!privateKey) {
          throw new Error('No unlocked private key found. Please login or reveal your key first.')
        }
        // Create a signer with the private key and BSC provider
        const signer = new ethers.Wallet(privateKey, provider)
        // Prepare and send transaction
        const tx = await signer.sendTransaction({
          to: recipientAddress,
          value: ethers.parseEther(amount)
        })
        // Wait for confirmation
        await tx.wait()
        const response = await provider.waitForTransaction(tx.hash, 1)
        if (response?.status == 0) {
          throw new Error('Transaction failed')
        }
        return response?.status
      } catch (error) {
        toast.error('Failed to send Bsc: ' + (error as RpcError)?.shortMessage || 'Unknown error')
        console.log('Error in buy transaction:', error)
        return null
      }
    },
    [provider, walletAddress]
  )
  return { sendToken }
}
