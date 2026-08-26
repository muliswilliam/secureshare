import type { NextApiRequest, NextApiResponse } from 'next'

import prisma from '../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await prisma.$queryRaw`SELECT 1`
    return res.status(200).json({ status: 'ok' })
  } catch (error) {
    console.log(error)
    return res.status(503).json({ status: 'error' })
  }
}
