import React from 'react'
import { MainNav } from '@/components/nav'
import { AppHead } from '../components/head'
import { ContentWrapper } from './content-wrapper'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AppHead />
      <MainNav />
      <ContentWrapper>
        {children}
      </ContentWrapper>
    </>
  )
}
