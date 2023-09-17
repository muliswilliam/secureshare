import React from 'react'
import { SignUp } from '@clerk/nextjs'
import MainLayout from '../layouts/main'

export default function Page() {
  return (
    <MainLayout>
      <div className="flex flex-row items-center justify-center h-[calc(100vh-334px)]">
        <SignUp routing="hash" />
      </div>
    </MainLayout>
  )
}
