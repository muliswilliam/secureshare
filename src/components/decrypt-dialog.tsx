import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

import { Button } from './ui/button'
import React from 'react'
import { Textarea } from './ui/textarea'

interface MessageProps {
  message: string
  open: boolean
  onClose: () => void
}

export function DecryptDialog({ message, open, onClose }: MessageProps) {
  // methods
  const onCopy = React.useCallback(async () => {
    await navigator.clipboard.writeText(message)
  }, [message])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Here you go!</DialogTitle>
          <DialogDescription className="py-2 text-primary">
            Copy and paste the encrypted link below within the body of your
            e-mail or instant message
          </DialogDescription>
        </DialogHeader>
        <Textarea
          className="text-sm h-[180px]"
          value={message}
        />
        <div className='flex gap-2'>
          <Button className='w-full' variant="secondary" onClick={onCopy}>
            Copy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
