export interface EncryptionDetails {
  version: number
  /** aes mode */
  mode: string
  /** AES Tag Length */
  tagLength: number
  /** Output of encryption process text */
  ct: string
  /** Cryptographic algorithm used */
  cipher: string,
  fileHandle?: {
    completed: boolean
    fileName: string
    url: string
  }
}

export interface ClientInfo {
  ipAddress: string
  userAgent: string
  language: string
}

export interface MessageCreatedEvent extends ClientInfo {
  userId?: string,
  publicId: string
}