import { Prisma } from '@prisma/client'

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
  const expiredMessagesFilter = {
    expiresAt: {
      lt: currentTime
    },
    status: {
      not: MessageStatus.EXPIRED
    }
  }

  const messages = await prisma.message.findMany({
    where: expiredMessagesFilter
  })

  if (messages.length === 0) {
    return { expiredCount: 0 }
  }

  await prisma.message.updateMany({
    where: expiredMessagesFilter,
    data: {
      status: MessageStatus.EXPIRED
    }
  })

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
