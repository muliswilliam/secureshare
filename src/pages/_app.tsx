import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/theme-provider'
import { dark } from '@clerk/themes'
import React from 'react'
import { Inter } from 'next/font/google'
import { Toaster } from '../components/ui/toaster'
import { TooltipProvider } from '../components/ui/tooltip'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap'
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <ClerkProvider
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        appearance={{
          layout: {
            logoPlacement: 'inside',
            logoImageUrl: '/logo.png'
          },
          variables: {
            colorPrimary: '#6C27D9'
          },
          baseTheme: dark
        }}
        {...pageProps}
      >
        <TooltipProvider>
          <div className={`${inter.className}`}>
            <Component {...pageProps} />
            <Toaster />
          </div>
        </TooltipProvider>
      </ClerkProvider>
    </ThemeProvider>
  )
}
