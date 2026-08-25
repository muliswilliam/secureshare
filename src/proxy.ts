import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/messages/(.*)',
  '/chats/(.*)',
  '/api/chat/livekit_token',
  '/api/files/upload',
  '/api/msg/new',
  '/api/msg/destroy',
  '/api/msg/message-viewed',
  '/api/ip'
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)","/","/(api|trpc)(.*)"],
}
