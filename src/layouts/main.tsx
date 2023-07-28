import React from 'react'
import { MainNav } from '@/components/nav'
import { Inter } from 'next/font/google'

// If loading a variable font, you don't need to specify the font weight
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`flex flex-col ${inter.className}`}>
      <MainNav className="mx-6" />
      {children}
    </div>
  )
}
