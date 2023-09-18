import React from 'react'
import '@livekit/components-styles'
import { LiveKitRoom, useToken } from '@livekit/components-react'
import MainLayout from '../../layouts/main'
import { HomeContent } from '../../components/home-content'
import { useRouter } from 'next/router'
import { LiveKitChat } from '../../components/livekit-chat'
import { NewChatDialog } from '../../components/new-chat-dialog'

export default function ChatPage() {
  const [isClient, setIsClient] = React.useState(false)
  const router = useRouter()
  const { roomName, username } = router.query as {
    roomName: string
    username: string
  }

  const token = useToken('/api/chat/livekit_token', roomName, {
    userInfo: {
      identity: username,
      name: username
    }
  })

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  if (token === '') {
    return <div>Getting token...</div>
  }

  return (
    <>
      <MainLayout>
        <HomeContent>
          {token && (
            <LiveKitRoom
              serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
              token={token}
              connectOptions={{ autoSubscribe: true }}
              connect={true}
              audio={false}
              video={false}
            >
              <LiveKitChat />
            </LiveKitRoom>
          )}
        </HomeContent>
        {isClient && <NewChatDialog open={!username} />}
      </MainLayout>
    </>
  )
}
