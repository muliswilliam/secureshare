import {
  Dialog,
  DialogContent,
  DialogDescription
} from '@/components/ui/dialog'
import React from 'react'
import { DialogHeader } from './ui/dialog'
import { Button } from './ui/button'

interface CounterDialogProps {
  open: boolean
  onClose: () => void
}

export function CounterDialog({ open, onClose }: CounterDialogProps) {
  // state
  const [counter, setCounter] = React.useState<number>(5)

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      if (counter > 0) {
        setCounter((prevCount) => prevCount - 1);
      }
    }, 1000); // 1000 milliseconds = 1 second

    return () => {
      clearInterval(intervalId);
    };
  }, [counter])

  React.useEffect(() => {
    if(counter === 0) {
      onClose()
    }
  }, [counter, onClose])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogDescription className="text-primary text-lg">
            Your message will appear in
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col justify-center items-center'>
          <h1 className='text-9xl font-bold text-primary my-5'>{counter}</h1>
          <Button className='inline-block' onClick={onClose}>Show right away</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
