import React from 'react'
import {
  useChat,
  useConnectionState,
  useRemoteParticipants,
  useRoomContext
} from '@livekit/components-react'
import { Button } from '../components/ui/button'
import { Loader2, SendHorizonal, Share2 } from 'lucide-react'
import { Input } from '../components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { ChatMessage } from '../components/chat-message'
import { RoomEvent } from 'livekit-client'
import { generateSummary } from '../shared/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

export function LiveKitChat() {
  const [message, setMessage] = React.useState<string>('')
  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  const toast = useToast()
  const { send, chatMessages, isSending } = useChat()
  const connectionState = useConnectionState()
  const roomContext = useRoomContext()
  const localParticipant = useRoomContext().localParticipant
  const remoteParticipants = useRemoteParticipants({
    updateOnlyOn: [
      RoomEvent.ParticipantConnected,
      RoomEvent.ParticipantDisconnected
    ]
  })

  roomContext.on(RoomEvent.ParticipantConnected, (participant) => {
    toast.toast({
      title: `${participant.identity} has joined`,
      description: `${participant.identity} has joined the room`,
      duration: 3000
    })
  })

  roomContext.on(RoomEvent.ParticipantDisconnected, (participant) => {
    toast.toast({
      title: `${participant.identity} has left`,
      description: `${participant.identity} has left the room`,
      duration: 3000
    })
  })

  const remoteParticipantNames = React.useMemo(() => {
    return remoteParticipants.map((p) => p.identity || 'Anonymous')
  }, [remoteParticipants])

  const scrollToBottom = React.useCallback(() => {
    if (chatMessages.length && scrollRef?.current) {
      scrollRef?.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      })
    }
  }, [chatMessages.length, scrollRef])

  const onSubmit = React.useCallback(() => {
    if (message.trim() !== '' && send !== undefined) {
      send(message)
      setMessage('')
    }
  }, [message, send])

  const onShareLink = React.useCallback(() => {
    navigator.clipboard.writeText(
      `${window.location.origin}/chats/${roomContext.name}${location.hash}`
    )
    toast.toast({
      title: 'Link copied',
      description: 'Room link copied to clipboard',
      duration: 3000
    })
  }, [toast, roomContext.name])

  React.useEffect(() => {
    scrollToBottom()
  }, [chatMessages, scrollToBottom])

  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onSubmit()
      }
    }
    document.addEventListener('keydown', handleKeyPress)
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [onSubmit])

  return (
    <>
      <div className="flex-1 p-4 sm:p-6 justify-between flex flex-col max-w-xl border rounded-md min-h-[calc(100vh-8rem)] max-h-[calc(100vh-8rem)]">
        <div className="flex flex-col w-full pb-3 border-b-2 border-accent">
          <div className="flex w-full sm:items-center justify-between">
            <div className="relative flex items-center space-x-4">
              <div className="flex flex-col leading-tight">
                <div className="mt-1 flex items-center gap-2">
                  {connectionState === 'connecting' ||
                  connectionState === 'reconnecting' ? (
                    <>
                      <Loader2 className="ml-2 h-6 w-6 animate-spin" />
                      <span className="text-sm text-yellow-500">
                        Connecting
                      </span>
                    </>
                  ) : connectionState === 'connected' ? (
                    <>
                      <span className="text-md text-foreground mr-3">
                        {localParticipant.name}
                      </span>
                      <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    </>
                  ) : (
                    <>
                      <span className="w-3 h-3 rounded-full bg-red-500"></span>
                      <span className="text-red-500">Disconnected</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="default" onClick={onShareLink}>
                <Share2 className="w-4 h-4 mr-2" />
                Share link
              </Button>
            </div>
          </div>
          <div className="flex w-full">
            <Tooltip>
              <TooltipTrigger>
                <span className="text-sm text-muted-foreground">
                  {generateSummary(remoteParticipantNames, 3)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {remoteParticipantNames.join(', ')}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div
          id="messages"
          className="flex flex-col space-y-4 p-3 overflow-y-auto  scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch gap-4"
        >
          {chatMessages.map((message, i) => (
            <ChatMessage
              key={i}
              position={message.from?.isLocal ? 'right' : 'left'}
              message={message.message}
              userNickname={message.from?.identity || 'Anonymous'}
              timestamp={message.timestamp}
            />
          ))}
          <div ref={scrollRef} />
        </div>
        <div className="flex justify-between gap-4">
          <Input
            placeholder="Write you message"
            className="focus-visible:ring-0"
            autoFocus
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="items-center inset-y-0 hidden sm:flex">
            <Button
              variant="default"
              onClick={onSubmit}
              disabled={
                message.trim() === '' || connectionState !== 'connected' || isSending
              }
            >
              {isSending ? (
                <>
                  Sending
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                'Send'
              )}
              <SendHorizonal className="ml-2 w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
