import { Message, Prisma } from '@prisma/client'

import prisma from '../lib/prisma'
import { EventType, MessageStatus } from '../shared/enums'
import { ClientInfo } from '../shared/types'

const unknownClientInfo: ClientInfo = {
  ipAddress: '',
  userAgent: '',
  language: ''
}

export async function sweepExpiredMessages(clientInfo: ClientInfo = unknownClientInfo) {
  const currentTime = new Date()

  // UPDATE ... RETURNING atomically claims and expires rows in one statement, so
  // concurrent sweeps can never both observe the same message as still-pending.
  const messages = await prisma.$queryRaw<Message[]>`
    UPDATE "Message"
    SET status = ${MessageStatus.EXPIRED}
    WHERE "expiresAt" < ${currentTime} AND status != ${MessageStatus.EXPIRED}
    RETURNING *
  `

  if (messages.length === 0) {
    return { expiredCount: 0 }
  }

  const events = messages.map((message) => ({
    eventType: EventType.MessageExpired,
    timestamp: new Date().toISOString(),
    eventData: {
      userId: null,
      publicId: message.publicId,
      ...clientInfo
    } as Prisma.JsonObject
  }))

  await prisma.event.createMany({ data: events })

  return { expiredCount: messages.length }
}
