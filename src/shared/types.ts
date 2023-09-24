import { NextMiddleware } from "next/server";
import { LocalAudioTrack, LocalVideoTrack } from 'livekit-client';
import { Prisma } from '@prisma/client';
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

export interface MessageEvent extends ClientInfo {
  userId?: string,
  publicId: string
}


export interface SessionProps {
  roomName: string;
  identity: string;
  audioTrack?: LocalAudioTrack;
  videoTrack?: LocalVideoTrack;
  region?: string;
  // turnServer?: RTCIceServer;
  forceRelay?: boolean;
}

export interface TokenResult {
  identity: string;
  accessToken: string;
}

export interface IpAddressInfo {
  country: string
  countryCode: string
  region: string
  regionName: string
  city: string
  zip: string
  lat: number
  lon: number
  timezone: string
  isp: string
  org: string
  as: string
  ipAddress: string
}

export type EventWithIpAddressInfo = Prisma.EventGetPayload<{
  event: true
  include: { ipAddressInfo: true }
}>

export type MiddlewareFactory = (middleware: NextMiddleware) => NextMiddleware;
