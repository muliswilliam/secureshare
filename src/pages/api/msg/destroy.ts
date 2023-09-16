// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { verifySignature } from '@upstash/qstash/dist/nextjs'

// utils
import prisma from '../../../lib/prisma'
import { getClientInfo } from '@/shared/utils'
import { EventType, MessageStatus } from '@/shared/enums'
import { Prisma } from '@prisma/client'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method } = req
    if (method !== 'POST') {
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).json({
        error: { message: `Method ${method} Not Allowed` }
      })
    }
    const currentTime = new Date()
    const expiredMessagesFilter = {
      expiresAt: {
        gt: currentTime // Filter items where expiresAt is greater than current time
      }
    }

    await prisma.message.updateMany({
      where: expiredMessagesFilter,
      data: {
        status: MessageStatus.EXPIRED
      }
    })

    const messages = await prisma.message.findMany({
      where: expiredMessagesFilter
    })

    // log message_expired
    const events = messages.map((message) => ({
      eventType: EventType.MessageExpired,
      timestamp: new Date().toISOString(),
      eventData: {
        userId: null,
        publicId: message.publicId,
        ...getClientInfo(req)
      } as Prisma.JsonObject
    }))

    await prisma.event.createMany({ data: events })

    return res.status(200).json({ success: true })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error })
  }
}

export default verifySignature(handler)
