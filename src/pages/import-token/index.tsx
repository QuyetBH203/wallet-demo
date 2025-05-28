import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useTokenErc20Infor } from '@/hook/useTokenErc20Infor'
import { useTokenStore } from '@/store/useTokenErc20'
import type { TokenInfo } from '@/type/token'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { RefreshCw } from 'lucide-react'

export default function ImportToken() {
  const [open, setOpen] = useState(false)
  const [tokenAddress, setTokenAddress] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { tokenName, tokenSymbol, tokenDecimals } = useTokenErc20Infor(tokenAddress)
  const { refreshData } = useTokenStore()

  const handleSubmit = async () => {
    if (!tokenAddress || !tokenName || !tokenSymbol) {
      toast.error('Invalid token information. Please check the token address.')
      return
    }

    setIsSubmitting(true)
    try {
      const tokenInfo: TokenInfo = {
        address: tokenAddress,
        name: tokenName,
        symbol: tokenSymbol,
        decimals: typeof tokenDecimals === 'bigint' ? Number(tokenDecimals) : tokenDecimals
      }

      // Check if we're in a Chrome extension environment
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        // Get existing tokens from Chrome storage
        chrome.storage.local.get(['erc20Tokens'], (result) => {
          const existingTokens: TokenInfo[] = result.erc20Tokens ? JSON.parse(result.erc20Tokens) : []

          // Check if token already exists
          const tokenExists = existingTokens.some(
            (token: TokenInfo) => token.address.toLowerCase() === tokenAddress.toLowerCase()
          )

          if (tokenExists) {
            toast.error('This token is already in your wallet')
            setIsSubmitting(false)
            return
          }

          // Add new token
          const updatedTokens = [...existingTokens, tokenInfo]

          // Save back to Chrome storage
          chrome.storage.local.set({ erc20Tokens: JSON.stringify(updatedTokens) }, () => {
            if (chrome.runtime.lastError) {
              console.error('Error saving token:', chrome.runtime.lastError.message)
              toast.error('Failed to save token')
            } else {
              toast.success(`${tokenSymbol} token added successfully`)
              setOpen(false)
            }
            setIsSubmitting(false)
          })
        })
        refreshData()
      } else {
        // Fallback for development environment
        console.log('Chrome storage API not available, using localStorage for development')
        const existingTokensStr = localStorage.getItem('erc20Tokens')
        const existingTokens: TokenInfo[] = existingTokensStr ? JSON.parse(existingTokensStr) : []

        // Check if token already exists
        const tokenExists = existingTokens.some(
          (token: TokenInfo) => token.address.toLowerCase() === tokenAddress.toLowerCase()
        )

        if (tokenExists) {
          toast.error('This token is already in your wallet')
          setIsSubmitting(false)
          return
        }

        // Add new token
        const updatedTokens = [...existingTokens, tokenInfo]

        // Save to localStorage
        localStorage.setItem('erc20Tokens', JSON.stringify(updatedTokens))
        toast.success(`${tokenSymbol} token added successfully`)
        setOpen(false)
        setIsSubmitting(false)
        refreshData()
      }
      console.log('Token added successfully')
    } catch (error) {
      console.error('Error saving token:', error)
      toast.error('Failed to save token')
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTokenAddress('')
    }
    setOpen(isOpen)
  }

  const handleRefresh = () => {
    refreshData()
  }

  return (
    <>
      <div className='flex flex-col w-full'>
        <div className='flex w-full justify-between'>
          <div>
            <Button onClick={handleRefresh} className='w-28 h-10 flex items-center justify-center'>
              <RefreshCw className='w-4 h-4 mr-2' />
              Refresh
            </Button>
          </div>
          <div>
            <Dialog open={open} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button className='w-28 h-10'>Import Token</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Token</DialogTitle>
                  <DialogDescription>Enter the token address to import</DialogDescription>
                </DialogHeader>
                <div className='flex flex-col gap-4 py-4'>
                  <div className='space-y-2'>
                    <label htmlFor='tokenAddress' className='text-sm font-medium'>
                      Token Address
                    </label>
                    <Input
                      id='tokenAddress'
                      placeholder='Token address'
                      value={tokenAddress}
                      onChange={(e) => setTokenAddress(e.target.value)}
                    />
                  </div>

                  {tokenAddress && (
                    <>
                      <div className='space-y-2'>
                        <label htmlFor='tokenName' className='text-sm font-medium'>
                          Token Name
                        </label>
                        <Input id='tokenName' value={tokenName || ''} readOnly />
                      </div>

                      <div className='space-y-2'>
                        <label htmlFor='tokenSymbol' className='text-sm font-medium'>
                          Token Symbol
                        </label>
                        <Input id='tokenSymbol' value={tokenSymbol || ''} readOnly />
                      </div>

                      <div className='space-y-2'>
                        <label htmlFor='tokenDecimals' className='text-sm font-medium'>
                          Token Decimals
                        </label>
                        <Input id='tokenDecimals' value={tokenDecimals?.toString() || ''} readOnly />
                      </div>
                    </>
                  )}

                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Importing...' : 'Import'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  )
}
