// write a nextjs endpoint that updates a message. check auth first to make sure the user is allowed to update the message.
// if the message is being updated to expired, then send a message to the user who created the message.

import { getAuth } from '@clerk/nextjs/server'
import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { method } = req
    // get the message id from the request params
    const { messageId } = req.query
    if (method === 'PUT' || method === 'DELETE') {
      const session = getAuth(req)
      const id = Number(messageId)
      const update = req.body
      const message = await prisma.message.findUnique({
        where: { id }
      })

      if (!message) {
        return res.status(404).json({
          error: { message: 'Message not found' }
        })
      }

      if (message.userId !== session?.userId) {
        return res.status(403).json({
          error: { message: 'Unauthorized' }
        })
      }

      if (method === 'PUT') {
        const result = await prisma.message.update({
          where: { id },
          data: update
        })

        return res.status(200).json(result)
      } else if (method === 'DELETE') {
        const result = await prisma.message.delete({
          where: { id }
        })

        return res.status(200).json(result)
      }
    } else {
      return res.status(405).json({
        error: { message: `Method ${method} Not Allowed` }
      })
    }
  } catch (error) {
    res.status(500).json({ error })
  }
}

export const config = {
  runtime: 'edge' // this is a pre-requisite
}
