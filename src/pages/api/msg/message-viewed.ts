// implement a hander for the message-viewed endpoint

import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { IpAddressInfo } from '../../../shared/types'
import prisma from '../../../lib/prisma'
import { Resend } from 'resend'
import { clerkClient } from '@clerk/nextjs'
import * as uaInfer from 'uainfer'
import MessageOpenedEmail from '../../../../emails/message-opened'

const schema = z.object({
  messageViewedEventId: z.number(),
  ipAddressInfo: z.custom<IpAddressInfo>(),
  messageId: z.number()
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

    if (!reqBody.success) {
      const { errors } = reqBody.error

      return res.status(400).json({
        error: { message: 'Invalid request', errors }
      })
    }

    const { messageViewedEventId, ipAddressInfo, messageId } = reqBody.data

    await prisma.ipAddressInfo.create({
      data: {
        ...ipAddressInfo,
        eventId: messageViewedEventId
      }
    })

    const message = await prisma.message.findUnique({
      where: {
        id: messageId
      }
    })

    if (message?.userId) {
      // send message viewed email
      const user = await clerkClient.users.getUser(message.userId)
      const resend = new Resend(process.env.RESEND_API_KEY)

      await resend.sendEmail({
        from: 'Secureshare <system@secureshare.sh>',
        to: user.emailAddresses[0].emailAddress,
        subject: 'Message Opened',
        react: MessageOpenedEmail({
          openingDate: new Date(),
          device: uaInfer.analyze(req.headers['user-agent'] ?? '').toString(),
          location: `${ipAddressInfo.city}, ${ipAddressInfo.country}`,
          ipAddress: ipAddressInfo.ipAddress
        })
      })
    }

    res.status(200).json({ success: true })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error })
  }
}
