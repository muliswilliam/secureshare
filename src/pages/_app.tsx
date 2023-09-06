import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/theme-provider'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ClerkProvider
        appearance={{
          layout: {
            logoPlacement: 'inside',
          },
          variables: {
            colorPrimary: '#6C27D9',
          }
        }}
        {...pageProps}
      >
        <Component {...pageProps} />
      </ClerkProvider>
    </ThemeProvider>
  )
}
