import { describe, it, expect, vi, beforeEach } from 'vitest'

const { sendMock } = vi.hoisted(() => ({
  sendMock: vi.fn().mockResolvedValue({})
}))

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: class {
    send = sendMock
  },
  PutObjectCommand: class {
    constructor(public input: unknown) {}
  }
}))

import { uploadFile } from '../storage'

describe('uploadFile', () => {
  beforeEach(() => {
    sendMock.mockClear()
  })

  it('uploads the buffer and returns the expected public URL shape', async () => {
    const url = await uploadFile(Buffer.from('hello'), 'abc123-file.txt')

    expect(url).toBe('https://cdn.example.com/test-bucket/abc123-file.txt')
    expect(sendMock).toHaveBeenCalledTimes(1)
  })
})
