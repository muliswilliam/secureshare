import React from 'react'
import MainLayout from '../layouts/main'
import SignInForm from '@/components/sign-in-form'

export default function Page() {
  return (
    <MainLayout>
      <div className="flex flex-row items-center justify-center h-[calc(100vh-334px)]">
        <SignInForm />
      </div>
    </MainLayout>
  )
}
