import React from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { GetServerSideProps } from 'next'
import { Message, Prisma } from '@prisma/client'
import { getAuth } from '@clerk/nextjs/server'

// utils
import { EncryptionDetails } from '../../shared/types'
import { base64UrlSafeToUint8Array, getClientInfo, getIpAddressInfo } from '../../shared/utils'
import prisma from '../../lib/prisma'
import { EventType, MessageStatus } from '../../shared/enums'
import { decryptFile, decryptText } from '../../shared/encrypt-decrypt'

// components
import MainLayout from '../../layouts/main'
import { TextMessageDialog } from '../../components/text-message-dialog'
const HomeContent = dynamic(() => import('../../components/home-content'), { ssr: true })
const MessageForm = dynamic(() => import('../../components/message-form'), { ssr: false })
import { FileDownloadDialog } from '../../components/file-download-dialog'
import { CounterDialog } from '../../components/counter-dialog'
import { ErrorDialog } from '../../components/error-dialog'



export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
  const message = await prisma.message.findFirst({
    where: {
      publicId: params?.publicId as string,
      status: {
        equals: MessageStatus.PENDING
      }
    }
  })

  if (message === null) {
    return {
      props: {
        message: null
      }
    }
  }

  // update message status to seen
  await prisma.message.update({
    where: {
      id: message.id
    },
    data: {
      status: MessageStatus.SEEN
    }
  })

  // log message_viewed
  const session = getAuth(req)
  const messageViewedEvent = {
    userId: session?.userId ?? undefined,
    publicId: message.publicId,
    ...getClientInfo(req)
  }

  const result = await prisma.event.create({
    data: {
      eventType: EventType.MessageViewed,
      timestamp: new Date().toISOString(),
      eventData: messageViewedEvent as Prisma.JsonObject
    }
  })

  // TODO: Notify user that message was viewed

  return {
    props: {
      messageViewedEventId: result.id,
      message
    }
  }
}


interface MessageProps {
  message: Message | null,
  messageViewedEventId: number | null
}

export default function MessagePage({ message, messageViewedEventId }: MessageProps) {
  // state
  const [isClient, setIsClient] = React.useState(false)
  const [secretkey, setSecretKey] = React.useState<string | undefined>()
  const [decryptedMessage, setDecryptedMessage] = React.useState<
    string | undefined
  >()
  const [showErrorDialog, setShowErrorDialog] = React.useState<boolean>(false)
  const [counterDialogOpen, setCounterDialogOpen] = React.useState<boolean>(true)
  const [messageDialogOpen, setMessageDialogOpen] = React.useState<boolean>(false)
  const [messageType, setMessageType] = React.useState<'text' | 'file'>()
  const [decryptedFile, setDecryptedFile] = React.useState<Blob>()
  const [fileName, setFileName] = React.useState<string>()

  // routing
  const router = useRouter()

  // refs
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  // callbacks
  const onClose = React.useCallback(() => {
    setMessageDialogOpen(false)
    router.push('/')
  }, [router])

  // effects
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
    if (message === null || secretkey === undefined) {
      setShowErrorDialog(true)
    } else {
      setShowErrorDialog(false)
      const decrypt = async () => {
        try {
          const encryptionKey = base64UrlSafeToUint8Array(secretkey)
          const encryptionDetails: EncryptionDetails = JSON.parse(message.body)
          if (encryptionDetails.fileHandle) {
            setMessageType('file')
            const { url, fileName } = encryptionDetails.fileHandle
            const response = await fetch(url)
            const encryptedFile = await response.blob()
            if (encryptedFile) {
              const blob = await decryptFile(encryptedFile, encryptionDetails.ct, encryptionKey)
              setDecryptedFile(blob)
              setFileName(fileName)
            } else {
              setShowErrorDialog(true)
              console.error('File not found')
            }
          } else {
            setMessageType('text')
            const text = await decryptText(encryptionDetails.ct, encryptionKey)
            setDecryptedMessage(text)

            if (messageViewedEventId) {
              const ipAddressInfo = await getIpAddressInfo()
              await fetch('/api/msg/message-viewed', {
                method: 'POST',
                headers: {  'Content-Type': 'application/json' },
                body: JSON.stringify({
                  messageViewedEventId,
                  ipAddressInfo,
                  messageId: message.id
                })
              })
            }
          }
        } catch (error) {
          setShowErrorDialog(true)
          console.error(error)
        }
      }
      decrypt()
    }
  }, [message, secretkey, messageViewedEventId])

  if (router.isFallback) return <div>Loading....</div>

  return (
    <MainLayout>
      <HomeContent>
        <MessageForm />
      </HomeContent>
      {isClient && (
        <>
          {message !== null ? (
            <CounterDialog
              open={counterDialogOpen}
              onClose={() => {
                setCounterDialogOpen(false)
                setMessageDialogOpen(true)
              }}
            />
          ) : (
            <ErrorDialog
              open={showErrorDialog}
              onClose={() => setShowErrorDialog(false)}
            />
          )}
          {messageType === 'text' ? (
            <TextMessageDialog
              message={decryptedMessage || ''}
              open={messageDialogOpen}
              onClose={onClose}
            />
          ) : (
            <>
              {fileName && decryptedFile && (
                <FileDownloadDialog
                  fileName={fileName}
                  decryptedFile={decryptedFile}
                  open={messageDialogOpen}
                  onClose={onClose}
                />
              )}
            </>
          )}
        </>
      )}
    </MainLayout>
  )
}
