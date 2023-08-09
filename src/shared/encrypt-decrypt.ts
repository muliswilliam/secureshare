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
    const encryptedDataUint8Array = combinedData.slice(
      Keychain.IV_LENGTH_IN_BYTES
    )
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

// Helper function to read a file as a Uint8Array
function readFileAsUint8Array(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      resolve(new Uint8Array(event.target!.result as ArrayBuffer))
    }
    reader.onerror = (error) => reject(error)
    reader.readAsArrayBuffer(file)
  })
}

function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onloadend = (e) => {
          if (e.target && e.target.readyState === FileReader.DONE) {
              resolve(new Uint8Array(e.target.result as ArrayBuffer));
          } else {
              reject(new Error("Failed to read blob content"));
          }
      };

      reader.onerror = () => {
          reject(new Error("FileReader error"));
      };

      reader.readAsArrayBuffer(blob);
  });
}

export async function encryptFile(
  file: File,
  encryptionKey: Uint8Array
): Promise<{
  encryptedFile: File
  iv: string
}> {
  try {
    // Convert the text to a Uint8Array
    const fileUintArray = await readFileAsUint8Array(file)
    // Generate a random IV (Initialization Vector)
    const iv = RandomGenerator.generateRandomBytes(Keychain.IV_LENGTH_IN_BYTES)
    // Convert  iv to a Base64 string
    const base64String = uint8ArrayToBase64UrlSafe(iv)
    // Create instance of CryptoKey from encryptionKey
    const cryptoKey = await Keychain.getCryptoKeyFromRawKey(encryptionKey)
    const keychain = new Keychain(cryptoKey)
    // Encrypt file data
    const encryptedData = await keychain.encrypt(iv, fileUintArray)
    // Create encrypted file
    const encryptedFile = new File([encryptedData], `${file.name}.enc`, {
      type: file.type
    })

    return {
      encryptedFile,
      iv: base64String
    }
  } catch (error) {
    console.error('Encryption error:', error)
    throw error
  }
}

export async function decryptFile(
  encryptedFile: Blob,
  ivBase64: string,
  encryptionKey: Uint8Array
): Promise<Blob> {
  try {
    // Convert the Base64 URL-safe iv string back to a Uint8Array
    const iv = base64UrlSafeToUint8Array(ivBase64)
    // Create instance of CryptoKey from encryptionKey
    const cryptoKey = await Keychain.getCryptoKeyFromRawKey(encryptionKey)
    const keychain = new Keychain(cryptoKey)
    const encryptedDataUint8Array = await blobToUint8Array(encryptedFile)
    // Decrypt the data
    const decryptedData = await keychain.decrypt(iv, encryptedDataUint8Array)
    // Convert the decrypted data back to a string
    return new Blob([decryptedData])
  } catch (error) {
    console.error('Decryption error:', error)
    throw error
  }
}