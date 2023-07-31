import Keychain from './keychain'
import RandomGenerator from './random-generator'
import { base64UrlSafeToUint8Array, uint8ArrayToBase64UrlSafe } from './utils'

export async function encryptText(
  text: string,
  encryptionKey: Uint8Array
): Promise<string> {
  try {
    // Convert the text to a Uint8Array
    const textUint8Array = new TextEncoder().encode(text)

    // Generate a random IV (Initialization Vector)
    const iv = RandomGenerator.generateRandomBytes(Keychain.IV_LENGTH_IN_BYTES)

    // Create instance of CryptoKey from encryptionKey
    const cryptoKey = await Keychain.getCryptoKeyFromRawKey(encryptionKey)
    const keychain = new Keychain(cryptoKey)

    // Encrypt the text
    const encryptedData = await keychain.encrypt(iv, textUint8Array)

    // Combine the IV and encrypted data into a single Uint8Array
    const combinedData = new Uint8Array(iv.length + encryptedData.byteLength)
    combinedData.set(iv)
    combinedData.set(new Uint8Array(encryptedData), iv.length)

    // Convert the combined data to a Base64 string
    const base64String = uint8ArrayToBase64UrlSafe(combinedData)

    return base64String
  } catch (error) {
    console.error('Encryption error:', error)
    throw error
  }
}

export async function decryptText(
  encryptedData: string,
  encryptionKey: Uint8Array
): Promise<string> {
  try {
    // Convert the Base64 URL-safe string back to a Uint8Array
    const combinedData = base64UrlSafeToUint8Array(encryptedData)

    // Extract the IV from the combined data (first 12 bytes)
    const iv = combinedData.slice(0, Keychain.IV_LENGTH_IN_BYTES)

    // Extract the encrypted data from the combined data (remaining bytes)
    const encryptedDataUint8Array = combinedData.slice(Keychain.IV_LENGTH_IN_BYTES)

    // Create instance of CryptoKey from encryptionKey
    const cryptoKey = await Keychain.getCryptoKeyFromRawKey(encryptionKey)
    const keychain = new Keychain(cryptoKey)

    // Decrypt the data
    const decryptedData = await keychain.decrypt(iv, encryptedDataUint8Array)

    // Convert the decrypted data back to a string
    const decryptedText = new TextDecoder().decode(decryptedData)

    return decryptedText
  } catch (error) {
    console.error('Decryption error:', error)
    throw error
  }
}
