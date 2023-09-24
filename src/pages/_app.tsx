import type { AppProps } from 'next/app'
import Script from 'next/script'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/theme-provider'
import { dark } from '@clerk/themes'
import React from 'react'
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
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
      />

      <Script id="analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
          page_path: window.location.pathname,
          });
        `}
      </Script>
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
    </>
  )
}
