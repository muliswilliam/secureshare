import { RoomServiceClient } from 'livekit-server-sdk'
import { addDays, addWeeks, addMonths } from 'date-fns'
import { NextApiRequest } from 'next'
import { ClientInfo } from './types'
import { IncomingMessage } from 'http'

/**
 * Converts a Uint8Array to a Base64 URL-safe string
 */
export function uint8ArrayToBase64UrlSafe(uint8Array: Uint8Array): string {
  // Convert the Uint8Array to a regular array of numbers
  const array: number[] = Array.from(uint8Array)

  // Create a binary string from the array to get a Base64 URL-safe string
  const binaryString: string = String.fromCharCode(...array)

  // Use btoa() to Base64 encode the binary string
  let base64String: string = btoa(binaryString)

  // Replace characters that are not safe in URLs with URL-safe counterparts
  base64String = base64String
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  return base64String
}

/**
 * Converts a Base64 URL-safe string to a Uint8Array
 */
export function base64UrlSafeToUint8Array(
  base64UrlSafeString: string
): Uint8Array {
  // Replace URL-safe characters with regular Base64 characters
  let base64String: string = base64UrlSafeString
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  // Pad the Base64 string with '=' characters as needed
  while (base64String.length % 4 !== 0) {
    base64String += '='
  }

  // Use atob() to decode the Base64 string into binary string
  const binaryString: string = atob(base64String)

  // Create an array of character codes from the binary string
  const array: number[] = Array.from(binaryString).map((char) =>
    char.charCodeAt(0)
  )

  // Return a Uint8Array created from the array of character codes
  return new Uint8Array(array)
}

// Function to add days, weeks, or months to the current timestamp
export function addTimeToDate(
  duration: number,
  unit: 'day' | 'week' | 'month'
): Date {
  const currentDate = new Date()

  switch (unit) {
    case 'day':
      return addDays(currentDate, duration)
    case 'week':
      return addWeeks(currentDate, duration)
    case 'month':
      return addMonths(currentDate, duration)
    default:
      throw new Error('Invalid unit. Use "day", "week", or "month".')
  }
}

export function getClientInfo(req: NextApiRequest | IncomingMessage) {
  const clientInfo: ClientInfo = {
    ipAddress: req.socket.remoteAddress ?? '',
    userAgent: req.headers['user-agent'] ?? '',
    language: req.headers['accept-language'] ?? ''
  }
  return clientInfo
}

export function generateColorFromText(text: string): string {
  // Generate RGB values based on the characters of the text
  const r =
    text
      .split('')
      .map((char) => char.charCodeAt(0))
      .reduce((acc, val) => acc + val, 0) % 256

  const g =
    text
      .split('')
      .map((char) => char.charCodeAt(0) * 2)
      .reduce((acc, val) => acc + val, 0) % 256

  const b =
    text
      .split('')
      .map((char) => char.charCodeAt(0) * 3)
      .reduce((acc, val) => acc + val, 0) % 256

  // Convert RGB values to a hexadecimal color representation
  const color = `#${r.toString(16).padStart(2, '0')}${g
    .toString(16)
    .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`

  return color
}

export function generateSummary(names: string[], maxNames?: number): string {
  const MAX_NAMES_DISPLAYED = maxNames || 3 // Maximum number of names to display
  const totalCount = names.length

  if (totalCount === 0) {
    return 'No one'
  } else if (totalCount <= MAX_NAMES_DISPLAYED) {
    return names.join(', ')
  } else {
    const displayedNames = names.slice(0, MAX_NAMES_DISPLAYED)
    const remainingCount = totalCount - MAX_NAMES_DISPLAYED
    return `${displayedNames.join(', ')}, and ${remainingCount} others`
  }
}

export function generateRoomId(length: number = 10): string {
  // Define the characters you want to use in the random string
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  // Create an array to store random bytes
  const randomBytes = new Uint8Array(length)

  // Fill the array with random values
  window.crypto.getRandomValues(randomBytes)

  // Initialize an empty string to store the result
  let randomString = ''

  // Map each random byte to a character from the charset
  for (let i = 0; i < randomBytes.length; i++) {
    randomString += charset[randomBytes[i] % charset.length]
  }

  return randomString
}

function checkKeys() {
  if (typeof process.env.LIVEKIT_API_KEY === 'undefined') {
    throw new Error('LIVEKIT_API_KEY is not defined')
  }
  if (typeof process.env.LIVEKIT_API_SECRET === 'undefined') {
    throw new Error('LIVEKIT_API_SECRET is not defined')
  }
}

export function getRoomClient(): RoomServiceClient {
  checkKeys()
  return new RoomServiceClient(getLiveKitURL())
}

export function getLiveKitURL(region?: string | string[]): string {
  let targetKey = 'LIVEKIT_URL'
  if (region && !Array.isArray(region)) {
    targetKey = `LIVEKIT_URL_${region}`.toUpperCase()
  }
  const url = process.env[targetKey]
  if (!url) {
    throw new Error(`${targetKey} is not defined`)
  }
  return url
}
