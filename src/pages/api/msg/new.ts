// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { Prisma } from '@prisma/client'
import { getAuth } from '@clerk/nextjs/server'
import { z } from 'zod'
import prisma from '../../../lib/prisma'
import { EventType } from '../../../shared/enums'
import { getClientInfo } from '../../../shared/utils'
import { IpAddressInfo } from '../../../shared/types'

const schema = z.object({
  encryptionDetails: z.string(),
  expiresAt: z.string(),
  ipAddressInfo: z.custom<IpAddressInfo>()
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { method } = req
    if (method !== 'POST') {
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).json({
        error: { message: `Method ${method} Not Allowed` }
      })
    }
    const reqBody = schema.safeParse(req.body)

    // If the request body is invalid, return a 400 error with the validation errors
    if (!reqBody.success) {
      const { errors } = reqBody.error

      return res.status(400).json({
        error: { message: 'Invalid request', errors }
      })
    }
    const session = getAuth(req)
    const { encryptionDetails, expiresAt, ipAddressInfo } = reqBody.data
    const publicId = crypto.randomBytes(16).toString('hex')
    const result = await prisma.message.create({
      data: {
        userId: session?.userId,
        publicId,
        body: encryptionDetails,
        expiresAt: expiresAt,
        notifyOnOpen: true
      }
    })

    // add message_created event
    const messageCreatedEvent = {
      userId: session?.userId ?? undefined,
      publicId,
      ...getClientInfo(req)
    }

    await prisma.event.create({
      data: {
        eventType: EventType.MessageCreated,
        timestamp: new Date().toISOString(),
        eventData: messageCreatedEvent as Prisma.JsonObject,
        ipAddressInfo: {
          create: { ...ipAddressInfo }
        }
      }
    })
    res.status(200).json(result)
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error })
  }
}
