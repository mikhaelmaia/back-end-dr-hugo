export enum UserRole {
  ADMIN = 'ADMIN',
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  INSTITUTION = 'INSTITUTION',
}

/**
 * Tipos de tokens disponíveis no sistema
 * 
 * @swagger
 * @enum {string}
 */
export enum TokenType {
  /** Token para redefinição de senha do usuário */
  PASSWORD_RESET = 'PASSWORD_RESET',
  /** Token para confirmação de endereço de e-mail */
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

/**
 * Tipos de termos disponíveis na plataforma
 * 
 * @swagger
 * @enum {string}
 */
export enum TermsType {
  /** Política de Privacidade da plataforma */
  PRIVACY_POLICY = 'privacy_policy',
  /** Termos de Serviço da plataforma */
  TERMS_OF_SERVICE = 'terms_of_service',
export enum DoctorSituation {
  REGULAR = 'A',
  SUSPENSAO_PARCIAL_PERMANENTE = 'B',
  CASSADO = 'C',
  INOPERANTE = 'E',
  FALECIDO = 'F',
  SEM_EXERCICIO_UF = 'G',
  INTERDICAO_CAUTELAR_TOTAL = 'I',
  SUSPENSO_ORDEM_JUDICIAL_PARCIAL = 'J',
  CANCELADO = 'L',
  SUSPENSAO_TOTAL_TEMPORARIA = 'M',
  INTERDICAO_CAUTELAR_PARCIAL = 'N',
  SUSPENSO_ORDEM_JUDICIAL_TOTAL = 'O',
  APOSENTADO = 'P',
  SUSPENSAO_TEMPORARIA = 'R',
  SUSPENSO_TOTAL = 'S',
  TRANSFERIDO = 'T',
  SUSPENSO_PARCIAL = 'X',
}

export enum DoctorRegistrationType {
  PRINCIPAL = 'P',
  SECUNDARIA = 'S',
  PROVISORIA = 'V',
  TEMPORARIA = 'T',
  ESTUDANTE_ESTRANGEIRO = 'E',
}
}