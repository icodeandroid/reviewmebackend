export enum UserRole {
  ADMIN = 'ADMIN',
  BUSINESS = 'BUSINESS',
  CUSTOMER = 'CUSTOMER',
}

export enum ReviewType {
  TEXT = 'TEXT',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
}

export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum SentimentLabel {
  POSITIVE = 'POSITIVE',
  NEUTRAL = 'NEUTRAL',
  NEGATIVE = 'NEGATIVE',
}

export enum AiStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum MediaKind {
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
}

export enum NotificationType {
  REVIEW_SUBMITTED = 'REVIEW_SUBMITTED',
  REVIEW_APPROVED = 'REVIEW_APPROVED',
  REVIEW_REJECTED = 'REVIEW_REJECTED',
  AI_COMPLETED = 'AI_COMPLETED',
  AI_FAILED = 'AI_FAILED',
  SYSTEM = 'SYSTEM',
}

export enum WidgetTheme {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
}

export enum WidgetLayout {
  LIST = 'LIST',
  GRID = 'GRID',
  CAROUSEL = 'CAROUSEL',
}