// implement a hander for the message-viewed endpoint

import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { IpAddressInfo } from '../../../shared/types'
import prisma from '../../../lib/prisma'

const schema = z.object({
  messageViewedEventId: z.number(),
  ipAddressInfo: z.custom<IpAddressInfo>()
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    const { messageViewedEventId, ipAddressInfo } = reqBody.data

    await prisma.ipAddressInfo.create({
      data: {
        ...ipAddressInfo,
        eventId: messageViewedEventId
      }
    })

    res.status(200).json({ success: true })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error })
  }
}

export const config = {
  runtime: 'edge' // this is a pre-requisite
}
