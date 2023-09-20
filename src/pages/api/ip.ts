import { NextApiRequest, NextApiResponse } from "next";
import { IpAddressInfo } from "../../shared/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    res.status(405).json({
      error: { message: `Method ${req.method} Not Allowed` }
    })
  }

  const response = await fetch('http://ip-api.com/json/')
  const data = await response.json()
  const { status, query, ...rest } = data

  if (status !== 'success') {
    res.status(500).json({ error: 'Failed to get IP address info' })
  }
  const ipInfo = { ...rest, ipAddress: query } as IpAddressInfo

  res.status(200).json({ ...ipInfo })
}