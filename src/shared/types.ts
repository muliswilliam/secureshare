import { LocalAudioTrack, LocalVideoTrack } from 'livekit-client';
import { Message, Event } from "@prisma/client"

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

export interface SerializedMessage extends Omit<Message, 'expiresAt' | 'createdAt'> {
  expiresAt: string
  createdAt: string
}

export interface SerializedEvent extends Omit<Event, 'timestamp'> {
  timestamp: string
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
