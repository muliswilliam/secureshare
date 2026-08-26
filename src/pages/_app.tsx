import React from 'react'
import type { AppProps } from 'next/app'
import { ThemeProvider } from '@/components/theme-provider'
import { Inter } from 'next/font/google'
import { Toaster } from '../components/ui/toaster'
import { TooltipProvider } from '../components/ui/tooltip'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap'
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <TooltipProvider>
          <div className={`${inter.className}`}>
            <Component {...pageProps} />
            <Toaster />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </>
  )
}
