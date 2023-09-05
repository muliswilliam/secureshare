import React from 'react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'

interface TextMessageProps {
  open: boolean
  onClose: () => void
}

export function ErrorDialog({ open, onClose }: TextMessageProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <h1 className='font-semibold text-center text-2xl'>Invalid Link</h1>
        <div className='flex flex-col'>
          <p className='font-semibold text-center text-lg my-6 text-red-400'>We are sorry, you don&apos;t have access to this message.</p>
          <h3 className='font-semibold text-md mb-4'>It has either:</h3>
          <ul className='font-light text-md list-inside list-disc'>
            <li className='mb-2'>Already been viewed</li>
            <li className='mb-2'>Expired</li>
            <li className='mb-2'>Been set as non-accessible within your country</li>
          </ul>
          <p className='mt-6 font-light text-md'>Please get in contact with the message sender to dispatch a new valid link.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
