import React from 'react'
import { useRouter } from 'next/router'
import { ExternalE2EEKeyProvider, Room, RoomOptions } from 'livekit-client'
import { LiveKitRoom, useToken } from '@livekit/components-react'

import { LiveKitChat } from '../components/livekit-chat'

export default function LivekitRoom() {
  const [isClient, setIsClient] = React.useState(false)
  const router = useRouter()
  const encryptedKey = router.asPath.split('#')[1]
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

  const roomOptions = React.useMemo((): RoomOptions => {
    if (!encryptedKey) return {}
    const worker = isClient
      ? new Worker(new URL('livekit-client/e2ee-worker', import.meta.url))
      : undefined
    const keyProvider = new ExternalE2EEKeyProvider()
    keyProvider.setKey(encryptedKey)

    if (!worker) return {}
    return {
      e2ee: {
        keyProvider,
        worker
      }
    }
  }, [encryptedKey, isClient])

  const room = React.useMemo(() => new Room(roomOptions), [roomOptions])

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  if (token === '') {
    return <div>Getting token...</div>
  }

  return (
    <>
      {token && (
        <LiveKitRoom
          room={room}
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
    </>
  )
}
