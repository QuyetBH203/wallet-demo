import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ethers } from 'ethers' // Cần ethers để giải mã Wallet

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!password) {
      setError('Password is required.')
      return
    }
    setError(null)
    setIsLoading(true)

    try {
      const getFromStorage = (key: string): Promise<string | null> =>
        new Promise((resolve, reject) => {
          if (chrome && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get([key], (result) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message)
              } else {
                resolve(result[key] as string | null)
              }
            })
          } else {
            // Fallback cho localStorage nếu chrome.storage không có
            console.warn('chrome.storage.local not found, using localStorage for login attempt.')
            resolve(localStorage.getItem(key))
          }
        })

      const encryptedKeystoreJson = await getFromStorage('walletKeystore')

      if (!encryptedKeystoreJson) {
        setError('No wallet found. Please create or import a wallet first.')
        setIsLoading(false)
        return
      }

      const decryptedWallet = await ethers.Wallet.fromEncryptedJson(encryptedKeystoreJson, password)

      // Nếu không có lỗi, giải mã thành côngss
      console.log('Wallet decrypted successfully. Address:', decryptedWallet.address)
      console.log(sessionStorage.getItem('unlockedPrivateKey'))

      // Store the unlocked private key in sessionStorage
      sessionStorage.setItem('unlockedPrivateKey', decryptedWallet.privateKey)

      setIsLoading(false)
      navigate('/transactions') // Điều hướng đến trang chính sau khi đăng nhập
    } catch (e) {
      console.error('Login failed:', e)
      let errorMessage = 'Login failed. Please check your password.'
      if (e instanceof Error) {
        if (e.message.toLowerCase().includes('invalid password') || e.message.toLowerCase().includes('bad password')) {
          errorMessage = 'Invalid password. Please try again.'
        } else if (e.message.toLowerCase().includes('unsupported keystore')) {
          errorMessage = 'Unsupported wallet format or version.'
        }
      }
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <div className='flex flex-col items-center justify-center h-full p-4'>
      <h1 className='text-3xl font-bold mb-8 text-center'>Login to BHQ Wallet</h1>
      <div className='w-full max-w-xs flex flex-col gap-4'>
        <div>
          <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-1'>
            Password:
          </label>
          <Input
            type='password'
            id='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Enter your password'
            className='border-black w-full'
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()} // Cho phép login bằng Enter
          />
        </div>

        {error && <p className='text-red-500 text-sm text-center'>{error}</p>}

        <Button
          className='bg-orange-500 border-2 border-black w-full hover:bg-orange-600 text-white py-3 mt-2'
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </div>
    </div>
  )
}
