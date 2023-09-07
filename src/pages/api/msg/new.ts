// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { getAuth } from '@clerk/nextjs/server'
import { z } from 'zod'
import prisma from '../../../lib/prisma'

const schema = z.object({
  encryptionDetails: z.string(),
  expiresAt: z.string(),
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
        error: { message: `Method ${method} Not Allowed` },
      })
    }
    const response = schema.safeParse(JSON.parse(req.body))

    // If the request body is invalid, return a 400 error with the validation errors
    if (!response.success) {
      const { errors } = response.error

      return res.status(400).json({
        error: { message: 'Invalid request', errors },
      })
    }
    const session = await getAuth(req)
    const { encryptionDetails, expiresAt } = response.data
    const publicId = crypto.randomBytes(16).toString('hex')
    const result = await prisma.message.create({
      data: {
        userId: session?.userId,
        publicId,
        body: encryptionDetails,
        expiresAt: expiresAt,
        notifyOnOpen: true,
      },
    })
    // TODO: if logged in user, record msg_creation event
    res.status(200).json(result)
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error })
  }
}
