import { BSC_RPC_URL } from '@/constants'
import { ethers } from 'ethers'
import { useEffect, useMemo, useState } from 'react'
import { erc20Abi } from 'viem'

export const useTokenErc20Infor = (tokenAddress: string) => {
  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [tokenDecimals, setTokenDecimals] = useState(0)
  const provider = useMemo(() => new ethers.JsonRpcProvider(BSC_RPC_URL), [])

  useEffect(() => {
    ;(async () => {
      try {
        if (!tokenAddress) return
        const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider)
        const name = await tokenContract.name()
        const symbol = await tokenContract.symbol()
        const decimals = await tokenContract.decimals()
        setTokenName(name)
        setTokenSymbol(symbol)
        setTokenDecimals(decimals)
      } catch (error) {
        console.log('Error getting token balance:', error)
      }
    })()
  }, [provider, tokenAddress])

  return { tokenName, tokenSymbol, tokenDecimals }
}
