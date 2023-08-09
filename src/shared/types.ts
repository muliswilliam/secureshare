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
    completed: boolean,
    url: string,
  }
}
