export enum EventType {
  Login = 'login',
  SignUp = 'sign_in',
  MessageCreated = 'message_created',
  MessageViewed  = 'message_viewed',
  MessageExpired = 'message_expired',
}

export enum MessageStatus {
  PENDING = 'pending',
  SEEN = 'seen',
  EXPIRED = 'expired'
}
