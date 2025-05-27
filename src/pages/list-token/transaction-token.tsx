import { useParams, useNavigate } from 'react-router-dom'
import { useTokenErc20Balance } from '@/hook/useTokenBalance'
import { useEffect, useState } from 'react'
import type { TokenInfo } from '@/type/token'
import { ArrowLeft, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSendTokenErc20 } from '@/hook/useSendTokenErc20'
import SendModal from '@/pages/transaction-page/send-modal'
import toast from 'react-hot-toast'

export default function TransactionToken() {
  const { address } = useParams<{ address: string }>()
  const navigate = useNavigate()
  const [token, setToken] = useState<TokenInfo | null>(null)
  const { balance, refetchBalance } = useTokenErc20Balance(address || '')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const { sendTokenErc20 } = useSendTokenErc20()
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [recipientAddress, setRecipientAddress] = useState('')
  const [sendAmount, setSendAmount] = useState('')
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (!address) return

    const loadToken = async () => {
      setLoading(true)
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get(['erc20Tokens'], (result) => {
            const storedTokens = result.erc20Tokens ? JSON.parse(result.erc20Tokens) : []
            const foundToken = storedTokens.find((t: TokenInfo) => t.address === address)
            setToken(foundToken || null)
            setLoading(false)
          })
        } else {
          const storedTokensStr = localStorage.getItem('erc20Tokens')
          const storedTokens = storedTokensStr ? JSON.parse(storedTokensStr) : []
          const foundToken = storedTokens.find((t: TokenInfo) => t.address === address)
          setToken(foundToken || null)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error loading token:', error)
        setLoading(false)
      }
    }

    loadToken()
  }, [address])

  const handleGoBack = () => {
    navigate(-1)
  }

  const truncateAddress = (address: string) => {
    if (!address) return ''
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSend = async () => {
    if (!address || !token) return

    if (!recipientAddress.trim()) {
      toast.error('Please enter a recipient address')
      return
    }

    if (!sendAmount || parseFloat(sendAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setIsSending(true)

    try {
      await sendTokenErc20(recipientAddress, sendAmount, address)
      setIsSendModalOpen(false)
      setRecipientAddress('')
      setSendAmount('')
      refetchBalance()
    } catch (error) {
      console.error('Send error:', error)
    } finally {
      setIsSending(false)
    }
  }

  if (loading) {
    return <div className='text-center py-4'>Loading token information...</div>
  }

  if (!token) {
    return <div className='text-center py-4'>Token not found</div>
  }

  return (
    <div className='p-4'>
      <div className='flex items-center mb-4'>
        <button
          onClick={handleGoBack}
          className='mr-2 p-2 rounded-full hover:bg-gray-100 transition-colors'
          aria-label='Go back'
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className='text-2xl font-bold'>Transaction for {token.symbol}</h1>
      </div>
      <div className='flex flex-col gap-2 w-full'>
        <div className='flex flex-row justify-between items-center'>
          <div className='font-medium text-xs'>Token Address</div>
          <div className='flex items-center'>
            <span className='mr-2'>{truncateAddress(token.address)}</span>
            <button
              onClick={() => copyToClipboard(token.address)}
              className='p-1 rounded-full hover:bg-gray-100 transition-colors'
              aria-label='Copy token address'
            >
              <Copy size={16} className={copied ? 'text-green-500' : ''} />
            </button>
            {copied && <span className='text-xs text-green-500 ml-1'>Copied!</span>}
          </div>
        </div>
        <div className='flex flex-row justify-between'>
          <div className='font-medium text-xs'>Network</div>
          <div>BSC testnet</div>
        </div>
        <div className='flex flex-row justify-between'>
          <div className='font-medium text-xs'>Token Balance</div>
          <div>{balance || '0'}</div>
        </div>
        <div className='flex flex-row justify-between'>
          <div className='font-medium text-xs'>Token Decimals</div>
          <div>{token.decimals}</div>
        </div>
      </div>
      {/* Transaction form would go here */}
      <div className='border w-full p-4 rounded-md mt-4'>
        <div className='flex w-full flex-row justify-between'>
          <Button
            variant='outline'
            className='bg-blue-400 text-white hover:bg-blue-500 hover:text-white'
            disabled={true}
          >
            Receive
          </Button>
          <Button
            variant='outline'
            className='bg-blue-400 text-white hover:bg-blue-500 hover:text-white'
            onClick={() => setIsSendModalOpen(true)}
            disabled={isSending}
          >
            {isSending ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>

      {/* Send Modal */}
      <SendModal
        recipientAddress={recipientAddress}
        setRecipientAddress={setRecipientAddress}
        sendAmount={sendAmount}
        setSendAmount={setSendAmount}
        handleSend={handleSend}
        open={isSendModalOpen}
        onOpenChange={setIsSendModalOpen}
      />
    </div>
  )
}
