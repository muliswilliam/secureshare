import { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { IncomingForm } from 'formidable'
import { supabase } from '../../../lib/supabase'
import { createReadStream } from 'fs'
import { once } from 'events'

const bucketName = process.env.SUPABASE_BUCKET_NAME as string

export const config = {
  api: {
    bodyParser: false
  }
}

async function readFileWithStreams(filePath: string): Promise<Buffer> {
  const readStream = createReadStream(filePath)
  let chunks: Uint8Array[] = []
  readStream.on('data', (chunk: Uint8Array) => {
    chunks.push(chunk)
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
    const buffer = await readFileWithStreams(file.filepath)
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(`${crypto.randomBytes(16).toString('hex')}-${file.originalFilename}`, buffer)

    if (error) {
      res.status(500).json({ message: 'Error uploading file', error })
    }

    if (data) {
      const result = supabase.storage.from(bucketName).getPublicUrl(data?.path)
      res.status(200).json({ success: true, url: result.data.publicUrl })
    }
  } catch (error) {
    res.status(400).json({ message: 'Parsing form failed', error })
  }
}
