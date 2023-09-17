import React from 'react'
import { SignIn } from '@clerk/nextjs'
import MainLayout from '../layouts/main'

export default function Page() {
  return (
    <MainLayout>
      <div className="flex flex-row items-center justify-center h-[calc(100vh-334px)]">
        <SignIn routing="hash" />
      </div>
    </MainLayout>
  )
}
