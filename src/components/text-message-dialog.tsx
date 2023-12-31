import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

import { Button } from './ui/button'
import { Textarea } from './ui/textarea'

interface TextMessageProps {
  message: string
  open: boolean
  onClose: () => void
}

export function TextMessageDialog({ message, open, onClose }: TextMessageProps) {
  // methods
  const onCopy = React.useCallback(async () => {
    await navigator.clipboard.writeText(message)
  }, [message])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className='text-2xl'>Here you go!</DialogTitle>
          <DialogDescription className="text-default py-3">
            SecureShare link self destruct and you can only use it once. So,
            make sure to copy it.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          className="text-sm h-[180px]"
          value={message}
          onChange={() => {}}
          readOnly={true}
        />
        <div className="flex gap-2">
          <Button className="w-full" variant="default" onClick={onCopy}>
            Copy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
