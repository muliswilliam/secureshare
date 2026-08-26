import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MessageStatus, EventType } from '../../shared/enums'

const { findManyMock, updateManyMock, createManyMock } = vi.hoisted(() => ({
  findManyMock: vi.fn(),
  updateManyMock: vi.fn(),
  createManyMock: vi.fn()
}))

vi.mock('../../lib/prisma', () => ({
  default: {
    message: { findMany: findManyMock, updateMany: updateManyMock },
    event: { createMany: createManyMock }
  }
}))

import { sweepExpiredMessages } from '../expire-messages'

describe('sweepExpiredMessages', () => {
  beforeEach(() => {
    findManyMock.mockReset()
    updateManyMock.mockReset()
    createManyMock.mockReset()
  })

  it('marks only past-due, not-already-expired messages as expired and logs one event each', async () => {
    findManyMock.mockResolvedValue([
      { id: 1, publicId: 'pub-1' },
      { id: 2, publicId: 'pub-2' }
    ])
    updateManyMock.mockResolvedValue({ count: 2 })
    createManyMock.mockResolvedValue({ count: 2 })

    const result = await sweepExpiredMessages()

    expect(result.expiredCount).toBe(2)

    const [findManyArgs] = findManyMock.mock.calls[0]
    expect(findManyArgs.where.status.not).toBe(MessageStatus.EXPIRED)
    expect(findManyArgs.where.expiresAt).toHaveProperty('lt')

    const [updateManyArgs] = updateManyMock.mock.calls[0]
    expect(updateManyArgs.data.status).toBe(MessageStatus.EXPIRED)

    const [createManyArgs] = createManyMock.mock.calls[0]
    expect(createManyArgs.data).toHaveLength(2)
    expect(createManyArgs.data[0].eventType).toBe(EventType.MessageExpired)
    expect(createManyArgs.data[0].eventData.publicId).toBe('pub-1')
    expect(createManyArgs.data[1].eventData.publicId).toBe('pub-2')
  })

  it('does nothing when there are no expired messages', async () => {
    findManyMock.mockResolvedValue([])

    const result = await sweepExpiredMessages()

    expect(result.expiredCount).toBe(0)
    expect(updateManyMock).not.toHaveBeenCalled()
    expect(createManyMock).not.toHaveBeenCalled()
  })
})
