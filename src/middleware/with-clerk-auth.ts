import { NextFetchEvent, NextMiddleware, NextRequest } from 'next/server'
import { authMiddleware } from '@clerk/nextjs'
import { publicRoutes } from './public-routes'
import { MiddlewareFactory } from '../shared/types'

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware

export const withAuth: MiddlewareFactory = (next: NextMiddleware) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    return await authMiddleware({
      // routes that do not require authentication
      publicRoutes: publicRoutes
    })(next.)
  }
}
