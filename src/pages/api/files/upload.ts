import { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { IncomingForm } from 'formidable'
import { uploadFile } from '../../../lib/storage'
import { createReadStream } from 'fs'
import { once } from 'events'

export const config = {
  api: {
    bodyParser: false
  }
}

async function readFileWithStreams(filePath: string): Promise<Buffer> {
  const readStream = createReadStream(filePath)
  const chunks: Buffer[] = []
  readStream.on('data', (chunk: string | Buffer) => {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  })
  readStream.on('error', (err) => {
    // Reject on stream error
    throw err
  })
  // Wait for the stream to end
  await once(readStream, 'end')
  return Buffer.concat(chunks)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  try {
    const form = new IncomingForm({ multiples: false })
    const parseResult = await form.parse(req)
    const files = parseResult[1]
    const file = Array.isArray(files.file) ? files.file[0] : files.file
    if (!file) {
      return res.status(400).json({ message: 'No file provided' })
    }
    const buffer = await readFileWithStreams(file.filepath)
    const key = `${crypto.randomBytes(16).toString('hex')}-${file.originalFilename}`
    const url = await uploadFile(buffer, key)

    res.status(200).json({ success: true, url })
  } catch (error) {
    res.status(400).json({ message: 'Error uploading file', error })
  }
}
