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
  url: string
  open: boolean
  onClose: () => void
}

export default function MessageDialog({ open, url, onClose }: MessageProps) {
  // memos
  const message = React.useMemo(() => {
    return `Hey, this is a SecureShare link. It will self-destruct after viewing. Make sure to copy it before closing it: ${url}`
  }, [url])

  // methods
  const onCopy = React.useCallback(async (type: 'url' | 'message') => {
    await navigator.clipboard.writeText(type === 'url' ? url : message)
  }, [url, message])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className='text-2xl'>Here you go!</DialogTitle>
          <DialogDescription className="pt-4 text-default">
            Copy and paste the encrypted link below within the body of your
            e-mail or instant message
          </DialogDescription>
        </DialogHeader>
        <Textarea
          className="text-sm h-[120px] my-4"
          value={message}
          readOnly={true}
        />
        <div className='flex justify-between'>
          <Button variant="default" onClick={() => onCopy('url')}>
            Copy link
          </Button>
          <Button variant="default" onClick={() => onCopy('message')}>
            Copy message
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
