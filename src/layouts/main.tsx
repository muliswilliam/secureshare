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
        <title> Share Secrets Quickly and Securely | SecureShare</title>
        <meta
          name="description"
          content="Experience the ultimate in online security with our top-rated encrypted messaging and chat room service. Enjoy robust password and file protection, complete with a self-destruct feature. Safeguard your sensitive data, utilize link tracking, and shield yourself from phishing attempts with our cutting-edge web app."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainNav className="mx-6" />
      <div
        className={`flex flex-col mx-auto w-full max-w-screen-xl px-2.5 lg:px-20`}
      >
        {children}
      </div>
    </>
  )
}
