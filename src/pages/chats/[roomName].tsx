import React from 'react'
import dynamic from 'next/dynamic'
import MainLayout from '../../layouts/main'
import LivekitRoom from '../../components/livekit-room'
import { useRouter } from 'next/router'
const HomeContent = dynamic(() => import('../../components/home-content'), {
  ssr: true
})
const NewChatDialog = dynamic(
  () => import('../../components/new-chat-dialog'),
  { ssr: true }
)

export default function ChatPage() {
  const router = useRouter()
  const { username } = router.query as {
    username: string
  }
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <>
      <MainLayout>
        <HomeContent>
          <LivekitRoom />
        </HomeContent>
        {isClient ? (
          <NewChatDialog
            open={!username}
            onClose={() => router.push('/', undefined, { shallow: true })}
          />
        ) : null}
      </MainLayout>
    </>
  )
}
