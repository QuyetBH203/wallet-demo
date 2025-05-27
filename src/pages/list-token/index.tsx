import TokenInfor from './token-infor'
import { useTokenErc20Balance } from '@/hook/useTokenBalance'
import { useEffect, useState } from 'react'
import type { TokenInfo } from '@/type/token'
import { useNavigate } from 'react-router-dom'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

export default function ListToken() {
  const [tokens, setTokens] = useState<TokenInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTokens = async () => {
      setLoading(true)
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get(['erc20Tokens'], (result) => {
            const storedTokens = result.erc20Tokens ? JSON.parse(result.erc20Tokens) : []
            setTokens(storedTokens)
            setLoading(false)
          })
        } else {
          // Fallback for development environment
          const storedTokensStr = localStorage.getItem('erc20Tokens')
          const storedTokens = storedTokensStr ? JSON.parse(storedTokensStr) : []
          setTokens(storedTokens)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error loading tokens:', error)
        setLoading(false)
      }
    }

    loadTokens()
  }, [])

  return (
    <>
      <div className='flex flex-col w-full space-y-4'>
        {loading ? (
          <div className='text-center py-4'>Loading tokens...</div>
        ) : tokens.length > 0 ? (
          <ScrollArea className='h-[70vh] pr-4'>
            <div className='grid grid-cols-1 gap-4'>
              {tokens.map((token, index) => (
                <div key={token.address}>
                  <TokenInfoWithBalance token={token} />
                  {index < tokens.length - 1 && <Separator className='my-1' />}
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className='text-center py-8'>No tokens found. Import a token to get started.</div>
        )}
      </div>
    </>
  )
}

function TokenInfoWithBalance({ token }: { token: TokenInfo }) {
  const { balance } = useTokenErc20Balance(token.address)
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/transaction-token/${token.address}`)
  }

  return (
    <div onClick={handleClick} className='cursor-pointer hover:bg-gray-100 transition-colors'>
      <TokenInfor symbol={token.symbol} balance={balance || '0'} />
    </div>
  )
}
