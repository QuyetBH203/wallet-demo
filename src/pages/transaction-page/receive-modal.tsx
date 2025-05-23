import { Dialog, DialogHeader, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import QRCode from 'react-qr-code'

export default function ReceiveModal({
  walletAddress,
  open,
  onOpenChange
}: {
  walletAddress: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Receive BNB</DialogTitle>
          <DialogDescription>Scan the QR code or copy the address below to receive BNB.</DialogDescription>
        </DialogHeader>
        <div className='flex flex-col items-center justify-center'>
          <QRCode value={`0x${walletAddress}`} size={256} />;
        </div>
        <div className='flex flex-col items-center justify-center'>
          <p className='text-sm text-gray-500'>{`0x${walletAddress}`}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
