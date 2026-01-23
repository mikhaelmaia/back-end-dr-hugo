export enum UserRole {
  ADMIN = 'ADMIN',
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  INSTITUTION = 'INSTITUTION',
}

export enum TokenType {
  PASSWORD_RESET = 'PASSWORD_RESET',
  EMAIL_CONFIRMATION = 'EMAIL_CONFIRMATION',
}

export enum MediaType {
  PNG = 'PNG',
  JPG = 'JPG',
  JPEG = 'JPEG',
  GIF = 'GIF',
  PDF = 'PDF',
  DOCX = 'DOCX',
  DOC = 'DOC',
  XLSX = 'XLSX',
  XLS = 'XLS',
  PPTX = 'PPTX',
  PPT = 'PPT',
  TXT = 'TXT',
  HTML = 'HTML',
}

export enum AuditEventType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum HttpHeaders {
  ForwardFor = 'x-forwarded-for',
  SessionId = 'x-session-id',
  ClientFingerprint = 'x-client-fingerprint',
  UserAgent = 'user-agent',
}

export enum TermsType {
  PRIVACY_POLICY = 'privacy_policy',
  TERMS_OF_SERVICE = 'terms_of_service',
}