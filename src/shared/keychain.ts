export default class Keychain {
  public static readonly KEY_LENGTH_IN_BYTES = 16
  public static readonly IV_LENGTH_IN_BYTES = 16
  public static readonly TAG_LENGTH_IN_BYTES = 16

  public static readonly ALGORITHM = 'AES-GCM'
  private readonly secretKey: CryptoKey
  private readonly tagLengthInBytes: number

  public constructor(
    secretKey: CryptoKey,
    tagLengthInBytes = Keychain.TAG_LENGTH_IN_BYTES
  ) {
    this.secretKey = secretKey
    this.tagLengthInBytes = tagLengthInBytes
  }

  public static async getCryptoKeyFromRawKey(
    rawKey: Uint8Array
  ): Promise<CryptoKey> {
    return await crypto.subtle.importKey(
      'raw',
      rawKey as BufferSource,
      {
        name: this.ALGORITHM,
      },
      true,
      ['encrypt', 'decrypt']
    )
  }

  public async encrypt(iv: Uint8Array, data: Uint8Array): Promise<ArrayBuffer> {
    return await crypto.subtle.encrypt(
      {
        name: Keychain.ALGORITHM,
        iv: iv as BufferSource,
        tagLength: this.tagLengthInBytes * 8,
      },
      this.secretKey,
      data as BufferSource
    )
  }

  public async decrypt(iv: Uint8Array, data: Uint8Array): Promise<ArrayBuffer> {
    return await crypto.subtle.decrypt(
      {
        name: Keychain.ALGORITHM,
        iv: iv as BufferSource,
        tagLength: this.tagLengthInBytes * 8,
      },
      this.secretKey,
      data as BufferSource
    )
  }
}
