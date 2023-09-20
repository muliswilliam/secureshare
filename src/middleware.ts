import { authMiddleware } from '@clerk/nextjs'

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  // routes that do not require authentication
  publicRoutes: [
    '/',
    '/messages/(.*)',
    '/chats/(.*)',
    '/api/chat/livekit_token',
    '/api/files/upload',
    '/api/msg/new',
    'api/msg/destroy',
    '/api/msg/message-viewed',
    'api/ip'
  ]
})

export const config = {
  matcher: ['/((?!_next/image|_next/static|favicon.ico).*)']
}
