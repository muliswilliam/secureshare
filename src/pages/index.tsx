import React from 'react'
import dynamic from 'next/dynamic'
import MainLayout from '../layouts/main'
const HomeContent = dynamic(() => import('../components/home-content'), { ssr: true })
const MessageDialog = dynamic(() => import('../components/message-dialog'), { ssr: false })
const MessageForm = dynamic(() => import('../components/message-form'), { ssr: false })

export default function Home() {
  // state
  const [isClient, setIsClient] = React.useState(false)
  const [showDialog, setShowDialog] = React.useState<boolean>(false)
  const [msgUrl, setMsgUrl] = React.useState<string>('')
  
  // methods
  const onSubmit = React.useCallback((url: string) => {
    setShowDialog(true)
    setMsgUrl(url)
  }, [])
  
  React.useEffect(() => {
    setIsClient(true)
  }, [])
 
  return (
    <MainLayout>
      <HomeContent>
        <MessageForm onSubmit={onSubmit} />
      </HomeContent>
      {isClient && showDialog && (
        <MessageDialog
          url={msgUrl}
          open={true}
          onClose={() => setShowDialog(false)}
        />
      )}
    </MainLayout>
  )
}
