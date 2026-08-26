import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { fromNodeHeaders } from 'better-auth/node'
import type { IncomingHttpHeaders } from 'http'

import prisma from './prisma'

function createAuth() {
  return betterAuth({
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    emailAndPassword: {
      enabled: true
    },
    user: {
      additionalFields: {
        role: {
          type: 'string',
          defaultValue: 'user',
          input: false
        }
      }
    },
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
    secret: process.env.BETTER_AUTH_SECRET
  })
}

const globalForAuth = globalThis as unknown as {
  auth: ReturnType<typeof createAuth> | undefined
}

export const auth = globalForAuth.auth ?? createAuth()

if (process.env.NODE_ENV !== 'production') globalForAuth.auth = auth

export async function getServerSession(headers: IncomingHttpHeaders) {
  return auth.api.getSession({ headers: fromNodeHeaders(headers) })
}

export async function getUserEmailById(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true }
  })
  return user?.email ?? null
}
