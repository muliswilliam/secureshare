import { HomeContent } from '../components/home-content'
import MainLayout from '../layouts/main'
import { MessageDialog } from '../components/message-dialog'
import { MessageForm } from '../components/message-form'
import React from 'react'

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
