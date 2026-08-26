import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

export const s3 = new S3Client({
  endpoint: process.env.STORAGE_ENDPOINT,
  region: process.env.STORAGE_REGION ?? 'auto',
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY ?? ''
  },
  forcePathStyle: true
})

export async function uploadFile(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const bucketName = process.env.STORAGE_BUCKET_NAME as string
  const publicUrl = (process.env.STORAGE_PUBLIC_URL as string)?.replace(/\/$/, '')

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: filename,
      Body: buffer
    })
  )

  return `${publicUrl}/${filename}`
}
