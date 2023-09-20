import { NextApiRequest, NextApiResponse } from "next";
import { IpAddressInfo } from "../../shared/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    res.status(405).json({
      error: { message: `Method ${req.method} Not Allowed` }
    })
  }

  // TODO: Use these values instead of making a request to ip-api.com
  // console.log('x-vercel-forwarded-for' ,req.headers['x-vercel-forwarded-for'])
  // console.log('x-vercel-ip-country' ,req.headers['x-vercel-ip-country'])
  // console.log('x-vercel-ip-country-region' ,req.headers['x-vercel-ip-country-region'])
  // console.log('x-vercel-ip-city' ,req.headers['x-vercel-ip-city'])
  // console.log('x-vercel-ip-longitude' ,req.headers['x-vercel-ip-longitude'])
  // console.log('x-vercel-ip-latitude' ,req.headers['x-vercel-ip-latitude'])
  // console.log('x-vercel-ip-timezone' ,req.headers['x-vercel-ip-timezone'])

  const ipAddress = req.headers['x-vercel-forwarded-for'] as string
  const response = await fetch(`http://ip-api.com/json/${ipAddress || ''}`)
  const data = await response.json()
  const { status, query, ...rest } = data
  if (status !== 'success') {
    return res.status(500).json({ error: 'Failed to get IP address info' })
  }
  const ipInfo = { ...rest, ipAddress: query } as IpAddressInfo

  return res.status(200).json({ ...ipInfo })
}
