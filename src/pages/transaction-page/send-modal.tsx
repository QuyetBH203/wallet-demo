import { Button } from '@/components/ui/button'
import { Dialog, DialogHeader, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export default function SendModal({
  recipientAddress,
  setRecipientAddress,
  sendAmount,
  setSendAmount,
  handleSend,
  open,
  onOpenChange
}: {
  recipientAddress: string
  setRecipientAddress: (address: string) => void
  sendAmount: string
  setSendAmount: (amount: string) => void
  handleSend: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send BNB</DialogTitle>
          <DialogDescription>Enter recipient address and amount.</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-2'>
            <label htmlFor='recipient' className='col-span-1 text-right text-sm'>
              To
            </label>
            <Input
              id='recipient'
              className='col-span-3'
              placeholder='0x...'
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-2'>
            <label htmlFor='amount' className='col-span-1 text-right text-sm'>
              Amount
            </label>
            <Input
              id='amount'
              type='number'
              className='col-span-3'
              placeholder='0.0'
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
            />
          </div>
        </div>
        <div className='flex justify-end'>
          <Button onClick={handleSend} className='bg-green-500 hover:bg-green-600 text-white'>
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
