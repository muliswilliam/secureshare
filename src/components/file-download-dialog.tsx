import {
  Dialog,
  DialogContent
} from '@/components/ui/dialog'
  import { File } from 'lucide-react';


import { Button } from './ui/button'
import React from 'react'

interface FileDownloadDialogProps {
  open: boolean
  fileName: string
  decryptedFile: Blob
  onClose: () => void
}

export function FileDownloadDialog({ fileName, decryptedFile, open, onClose }: FileDownloadDialogProps) {
  // methods
  const downloadFile = React.useCallback(() => {
    // Create a temporary anchor element
    const a = document.createElement('a');

    // Create a blob URL
    const url = window.URL.createObjectURL(decryptedFile);

    // Set the download attributes on the anchor
    a.href = url;
    a.download = fileName;

    // Add the anchor to the document to support Firefox
    document.body.appendChild(a);

    // Trigger a click event on the anchor to start the download
    a.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, [decryptedFile, fileName])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <div className='flex flex-col'>
          <p className='text-md text-default mb-4'>Your secret file:</p>
          <div className='flex flex-row h-9 items-center justify-between rounded-lg bg-muted p-6 text-muted-foreground'>
            <File size='16px'/>
            <p className='text-gray-400 text-md font-light overflow-hidden text-ellipsis whitespace-nowrap w-[200px]'>{fileName}</p>
            <Button type='button' variant='ghost' className='text-primary outline-none' onClick={downloadFile}>Download</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
