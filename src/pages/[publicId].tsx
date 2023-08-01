import { DecryptDialog } from '../components/decrypt-dialog'
import { EncryptionDetails } from '../shared/types'
import { GetServerSideProps } from 'next'
import { HomeContent } from '../components/home-content'
import MainLayout from '../layouts/main'
import { Message } from '@prisma/client'
import { MessageForm } from '../components/message-form'
import React from 'react'
import { base64UrlSafeToUint8Array } from '../shared/utils'
import { decryptText } from '../shared/encrypt-decrypt-text'
import prisma from '../lib/prisma'
import { useRouter } from 'next/router'

interface MessageProps {
  message: Message | null
}

export default function MessagePage({ message }: MessageProps) {
  const [isClient, setIsClient] = React.useState(false)
  const [secretkey, setSecretKey] = React.useState<string | undefined>()
  const [decryptedMessage, setDecryptedMessage] = React.useState<string | undefined>()
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

  React.useEffect(() => {
    if (!message || !secretkey)
      return setError(
        'Unable to decrypt your message. The link might expired or missing key details.'
      )
    const decrypt = async () => {
      try {
        const encryptionKey = base64UrlSafeToUint8Array(secretkey)
        const encryptionDetails: EncryptionDetails = JSON.parse(message.body)
        const text = await decryptText(encryptionDetails.ct, encryptionKey)
        setDecryptedMessage(text)        
      } catch (error) {
        setError('Something went wrong decrypting you message. Please try again later.')
        console.error(error)
      }
    }
    decrypt()
  }, [message, secretkey])

  if (router.isFallback) return <div>Loading....</div>

  console.log(error)
  return (
    <MainLayout>
      <HomeContent>
        <MessageForm />
      </HomeContent>
      {isClient && message && (
        <DecryptDialog
          message={decryptedMessage || ''}
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
  console.log(message)
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
