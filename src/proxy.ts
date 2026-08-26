import { NextResponse, type NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

const publicExactRoutes = [
  '/',
  '/sign-in',
  '/sign-up',
  '/api/chat/livekit_token',
  '/api/files/upload',
  '/api/msg/new',
  '/api/msg/message-viewed',
  '/api/health',
  '/api/ip'
]

const publicPrefixRoutes = ['/messages/', '/chats/', '/api/auth/']

function isPublicRoute(pathname: string) {
  return (
    publicExactRoutes.includes(pathname) ||
    publicPrefixRoutes.some((prefix) => pathname.startsWith(prefix))
  )
}

export default function proxy(req: NextRequest) {
  if (isPublicRoute(req.nextUrl.pathname)) {
    return NextResponse.next()
  }

  const sessionCookie = getSessionCookie(req)
  if (!sessionCookie) {
    const signInUrl = new URL('/sign-in', req.url)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)']
}
