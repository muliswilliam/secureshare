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
