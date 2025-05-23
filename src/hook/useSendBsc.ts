import { useCallback, useMemo } from 'react'
import { ethers } from 'ethers'
import { BSC_RPC_URL } from '@/constants'
import { useWalletAddress } from './useWalletAddress'

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
      if (!walletAddress) {
        throw new Error('No wallet address available')
      }
      // Retrieve unlocked private key (should be stored after login or reveal)
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
      return tx
    },
    [provider, walletAddress]
  )
  return { sendToken }
}
