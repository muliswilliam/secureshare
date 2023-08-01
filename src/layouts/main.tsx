import React from 'react'
import { MainNav } from '@/components/nav'
import { Inter } from 'next/font/google'
import Head from 'next/head'

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
    <>
      <Head>
        <title>Secure Share</title>
        <meta name="description" content="Share passwords securely." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`flex flex-col ${inter.className}`}>
        <MainNav className="mx-6" />
        {children}
      </div>
    </>
  )
}
