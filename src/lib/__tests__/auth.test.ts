import { describe, it, expect, vi, beforeEach } from 'vitest'

const { getSessionMock, findUniqueMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  findUniqueMock: vi.fn()
}))

vi.mock('better-auth', () => ({
  betterAuth: () => ({
    api: { getSession: getSessionMock }
  })
}))
vi.mock('better-auth/adapters/prisma', () => ({
  prismaAdapter: () => ({})
}))
vi.mock('better-auth/node', () => ({
  fromNodeHeaders: (headers: unknown) => headers
}))
vi.mock('../prisma', () => ({
  default: { user: { findUnique: findUniqueMock } }
}))

import { getServerSession, getUserEmailById } from '../auth'

describe('getServerSession', () => {
  beforeEach(() => {
    getSessionMock.mockReset()
  })

  it('returns the session shape given a valid request', async () => {
    getSessionMock.mockResolvedValue({
      user: { id: 'user_1', email: 'a@example.com', role: 'user' },
      session: { id: 'session_1' }
    })

    const session = await getServerSession({} as never)

    expect(session?.user.id).toBe('user_1')
    expect(getSessionMock).toHaveBeenCalledTimes(1)
  })

  it('returns null when there is no session', async () => {
    getSessionMock.mockResolvedValue(null)

    const session = await getServerSession({} as never)

    expect(session).toBeNull()
  })
})

describe('getUserEmailById', () => {
  beforeEach(() => {
    findUniqueMock.mockReset()
  })

  it('returns the email for an existing user', async () => {
    findUniqueMock.mockResolvedValue({ email: 'owner@example.com' })

    const email = await getUserEmailById('user_1')

    expect(email).toBe('owner@example.com')
    expect(findUniqueMock).toHaveBeenCalledWith({
      where: { id: 'user_1' },
      select: { email: true }
    })
  })

  it('returns null when the user does not exist', async () => {
    findUniqueMock.mockResolvedValue(null)

    const email = await getUserEmailById('missing')

    expect(email).toBeNull()
  })
})
