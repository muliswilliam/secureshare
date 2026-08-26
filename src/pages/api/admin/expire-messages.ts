import type { NextApiRequest, NextApiResponse } from 'next'

import { getServerSession } from '../../../lib/auth'
import { sweepExpiredMessages } from '../../../jobs/expire-messages'
import { getClientInfo } from '../../../shared/utils'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({
      error: { message: `Method ${req.method} Not Allowed` }
    })
  }

  const session = await getServerSession(req.headers)
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!session || role !== 'admin') {
    return res.status(403).json({ error: { message: 'Forbidden' } })
  }

  try {
    const result = await sweepExpiredMessages(getClientInfo(req))
    return res.status(200).json({ success: true, ...result })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error })
  }
}
