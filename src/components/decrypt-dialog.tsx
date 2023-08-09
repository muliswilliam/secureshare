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
import { cn } from '../lib/utils'

interface MessageProps {
  message: string
  open: boolean
  error?: string
  onClose: () => void
}

export function DecryptDialog({ message, open, error, onClose }: MessageProps) {
  // methods
  const onCopy = React.useCallback(async () => {
    await navigator.clipboard.writeText(message)
  }, [message])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {error ? 'Something went wrong' : 'Here you go!'}
          </DialogTitle>
          <DialogDescription
            className={cn('py-2', error ? 'text-red-400' : 'text-primary')}
          >
            {error
              ? error
              : `SecureShare link self destruct and you can only use it once. So, make sure to copy it.`}
          </DialogDescription>
        </DialogHeader>
        {!error && (
          <>
            <Textarea
              className="text-sm h-[180px]"
              value={message}
              onChange={() => {}}
              readOnly={true}
            />
            <div className="flex gap-2">
              <Button className="w-full" variant="secondary" onClick={onCopy}>
                Copy
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
