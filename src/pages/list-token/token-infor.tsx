export default function TokenInfor({ symbol, balance }: { symbol: string; balance: string }) {
  return (
    <>
      <div className='w-full flex flex-row justify-between bg-gray-100 px-2 py-2 rounded-sm'>
        <div className='flex'>
          <h1 className='font-bold text-xl'>{symbol}</h1>
        </div>
        <div className=' flex flex-col justify-between'>
          <div className='flex justify-end'>
            <h1 className='font-medium text-base text-blue-300'>Balance</h1>
          </div>
          <div className='flex text-xs font-medium'>
            <h1>{balance}</h1>
          </div>
        </div>
      </div>
    </>
  )
}
