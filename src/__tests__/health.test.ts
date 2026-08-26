import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMocks } from 'node-mocks-http'

const { queryRawMock } = vi.hoisted(() => ({ queryRawMock: vi.fn() }))

vi.mock('../lib/prisma', () => ({
  default: { $queryRaw: queryRawMock }
}))

import handler from '../pages/api/health'

describe('/api/health', () => {
  beforeEach(() => {
    queryRawMock.mockReset()
  })

  it('returns 200 when the database is reachable', async () => {
    queryRawMock.mockResolvedValue([{ '?column?': 1 }])

    const { req, res } = createMocks({ method: 'GET' })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({ status: 'ok' })
  })

  it('returns 503 when the database is unreachable', async () => {
    queryRawMock.mockRejectedValue(new Error('connection refused'))

    const { req, res } = createMocks({ method: 'GET' })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(503)
    expect(JSON.parse(res._getData())).toEqual({ status: 'error' })
  })
})
