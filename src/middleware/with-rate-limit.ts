import { NextFetchEvent, NextMiddleware, NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { publicRoutes } from './public-routes'
import { MiddlewareFactory } from '../shared/types'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL as string,
  token: process.env.UPSTASH_REDIS_REST_TOKEN as string
})

const ratelimit = new Ratelimit({
  redis: redis,
  // 100 messages per day
  limiter: Ratelimit.slidingWindow(parseInt(process.env.FREE_TIER_MESSAGES_LIMIT || '1'), '1 d')
})

export const withRateLimit: MiddlewareFactory = (next: NextMiddleware) => {
  // return async (request: NextRequest, _next: NextFetchEvent) => {
  //   const ip =
  //     request.ip || request.headers.get('x-vercel-forwarded-for') || '127.0.0.1'
  //   const { success } = await ratelimit.limit(ip)
  //   console.log(`Rate limit ${ip} ${success ? 'passed' : 'blocked'}`)
  //   return success
  //     ? next(request, _next)
  //     : NextResponse.redirect(new URL('/blocked', request.url))
  // }
  return async (request: NextRequest, _next: NextFetchEvent) => {
    console.log("Log some data here", request.nextUrl.pathname);
    return next(request, _next);
  };
}

