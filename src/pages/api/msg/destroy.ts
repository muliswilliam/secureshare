// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { verifySignature } from '@upstash/qstash/dist/nextjs';

import prisma from '../../../lib/prisma'

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { method } = req
    if (method !== 'POST') {
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).json({
        error: { message: `Method ${method} Not Allowed` },
      })
    }
    const currentTime = new Date()
    const expiredMessagesFilter = {
      expiresAt: {
        gt: currentTime // Filter items where expiresAt is greater than current time
      }
    }

    await prisma.message.deleteMany({
      where: expiredMessagesFilter
    })

    return res.status(200).json({ success: true })
    
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error })
  }
}

export default verifySignature(handler)