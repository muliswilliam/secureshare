import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EventType } from '../../shared/enums'

const { queryRawMock, createManyMock } = vi.hoisted(() => ({
  queryRawMock: vi.fn(),
  createManyMock: vi.fn()
}))

vi.mock('../../lib/prisma', () => ({
  default: {
    $queryRaw: queryRawMock,
    event: { createMany: createManyMock }
  }
}))

import { sweepExpiredMessages } from '../expire-messages'

describe('sweepExpiredMessages', () => {
  beforeEach(() => {
    queryRawMock.mockReset()
    createManyMock.mockReset()
  })

  it('marks only past-due, not-already-expired messages as expired and logs one event each', async () => {
    queryRawMock.mockResolvedValue([
      { id: 1, publicId: 'pub-1' },
      { id: 2, publicId: 'pub-2' }
    ])
    createManyMock.mockResolvedValue({ count: 2 })

    const result = await sweepExpiredMessages()

    expect(result.expiredCount).toBe(2)
    expect(queryRawMock).toHaveBeenCalledTimes(1)

    const [createManyArgs] = createManyMock.mock.calls[0]
    expect(createManyArgs.data).toHaveLength(2)
    expect(createManyArgs.data[0].eventType).toBe(EventType.MessageExpired)
    expect(createManyArgs.data[0].eventData.publicId).toBe('pub-1')
    expect(createManyArgs.data[1].eventData.publicId).toBe('pub-2')
  })

  it('does nothing when there are no expired messages', async () => {
    queryRawMock.mockResolvedValue([])

    const result = await sweepExpiredMessages()

    expect(result.expiredCount).toBe(0)
    expect(createManyMock).not.toHaveBeenCalled()
  })
})
