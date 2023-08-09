import { DecryptDialog } from '../components/decrypt-dialog'
import { EncryptionDetails } from '../shared/types'
import { GetServerSideProps } from 'next'
import { HomeContent } from '../components/home-content'
import MainLayout from '../layouts/main'
import { Message } from '@prisma/client'
import { MessageForm } from '../components/message-form'
import React from 'react'
import { base64UrlSafeToUint8Array } from '../shared/utils'
import { decryptFile, decryptText } from '../shared/encrypt-decrypt'
import prisma from '../lib/prisma'
import { useRouter } from 'next/router'

interface MessageProps {
  message: Message | null
}

export default function MessagePage({ message }: MessageProps) {
  const [isClient, setIsClient] = React.useState(false)
  const [secretkey, setSecretKey] = React.useState<string | undefined>()
  const [decryptedMessage, setDecryptedMessage] = React.useState<
    string | undefined
  >()
  const [error, setError] = React.useState<string | undefined>()
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(true)
  const router = useRouter()
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    setIsClient(true)

    if (typeof window !== 'undefined') {
      setSecretKey(window.location.hash.substring(1))
    }
  }, [])

  React.useEffect(() => {
    buttonRef.current?.click()
  }, [buttonRef])

  const downloadBlob = (blob: Blob, filename: string) => {
    // Create a temporary anchor element
    const a = document.createElement('a');

    // Create a blob URL
    const url = window.URL.createObjectURL(blob);

    // Set the download attributes on the anchor
    a.href = url;
    a.download = filename;

    // Add the anchor to the document to support Firefox
    document.body.appendChild(a);

    // Trigger a click event on the anchor to start the download
    a.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

  React.useEffect(() => {
    if (message === null || secretkey === undefined) {
      setError(
        'Unable to decrypt your message. The link might be expired or missing key details.'
      )
    } else {
      setError(undefined)
      const decrypt = async () => {
        try {
          const encryptionKey = base64UrlSafeToUint8Array(secretkey)
          const encryptionDetails: EncryptionDetails = JSON.parse(message.body)
          if (encryptionDetails.fileHandle) {
            const { url, fileName} = encryptionDetails.fileHandle
            const response = await fetch(url)
            const encryptedFile = await response.blob()
            if(encryptedFile) {
              const blob = await decryptFile(encryptedFile, encryptionDetails.ct, encryptionKey)
              downloadBlob(blob, fileName)

            } else {
              setError('File not found')
            }
          } else {
            const text = await decryptText(encryptionDetails.ct, encryptionKey)
            setDecryptedMessage(text)
          }
        } catch (error) {
          setError(
            'Something went wrong decrypting you message. Please try again later.'
          )
          console.error(error)
        }
      }
      decrypt()
    }
  }, [message, secretkey])

  if (router.isFallback) return <div>Loading....</div>

  return (
    <MainLayout>
      <HomeContent>
        <MessageForm />
      </HomeContent>
      {isClient && (
        <DecryptDialog
          message={decryptedMessage || ''}
          error={error}
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false)
            router.push('/')
          }}
        />
      )}
    </MainLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const message = await prisma.message.findFirst({
    where: {
      publicId: params?.publicId as string
    }
  })

  if (message === null) {
    return {
      props: {
        message: null
      }
    }
  }

  // destroy the message
  // await prisma.message.delete({
  //   where: {
  //     id: message.id
  //   }
  // })

  // TODO: Notify user that message was viewed

  return {
    props: {
      message: {
        ...message,
        createdAt: message?.createdAt.toISOString(),
        expiresAt: message?.expiresAt.toISOString()
      }
    }
  }
}
