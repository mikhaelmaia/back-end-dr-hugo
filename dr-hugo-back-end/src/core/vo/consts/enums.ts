export enum UserRole {
  ADMIN = 'ADMIN',
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  INSTITUTION = 'INSTITUTION',
}

export enum EnumType {
  BRAZILIAN_STATE = 'BRAZILIAN_STATE',
  DOCTOR_SPECIALIZATION_TYPE = 'DOCTOR_SPECIALIZATION_TYPE',
  MEDICAL_INSTITUTION_TYPE = 'MEDICAL_INSTITUTION_TYPE',
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
}

/** Especializações médicas reconhecidas pelo Conselho Federal de Medicina (CFM)
 * 
 * @swagger
 * @enum {string}
 */
export enum DoctorSpecializationType {
  ACUPUNCTURE = 'Acupuntura',
  ALLERGY_IMMUNOLOGY = 'Alergia e imunologia',
  ANESTHESIOLOGY = 'Anestesiologia',
  ANGIOLOGY = 'Angiologia',
  CARDIOLOGY = 'Cardiologia',
  CARDIOVASCULAR_SURGERY = 'Cirurgia cardiovascular',
  HAND_SURGERY = 'Cirurgia da mão',
  HEAD_AND_NECK_SURGERY = 'Cirurgia de cabeça e pescoço',
  DIGESTIVE_SYSTEM_SURGERY = 'Cirurgia do aparelho digestivo',
  GENERAL_SURGERY = 'Cirurgia geral',
  ONCOLOGIC_SURGERY = 'Cirurgia oncológica',
  PEDIATRIC_SURGERY = 'Cirurgia pediátrica',
  PLASTIC_SURGERY = 'Cirurgia plástica',
  THORACIC_SURGERY = 'Cirurgia torácica',
  VASCULAR_SURGERY = 'Cirurgia vascular',
  INTERNAL_MEDICINE = 'Clínica médica',
  COLOPROCTOLOGY = 'Coloproctologia',
  DERMATOLOGY = 'Dermatologia',
  ENDOCRINOLOGY_METABOLOGY = 'Endocrinologia e metabologia',
  ENDOSCOPY = 'Endoscopia',
  GASTROENTEROLOGY = 'Gastroenterologia',
  MEDICAL_GENETICS = 'Genética médica',
  GERIATRICS = 'Geriatria',
  GYNECOLOGY_OBSTETRICS = 'Ginecologia e obstetrícia',
  HEMATOLOGY_HEMOTHERAPY = 'Hematologia e hemoterapia',
  HOMEOPATHY = 'Homeopatia',
  INFECTOLOGY = 'Infectologia',
  MASTOLOGY = 'Mastologia',
  EMERGENCY_MEDICINE = 'Medicina de emergência',
  FAMILY_COMMUNITY_MEDICINE = 'Medicina de família e comunidade',
  OCCUPATIONAL_MEDICINE = 'Medicina do trabalho',
  TRAFFIC_MEDICINE = 'Medicina do tráfego',
  SPORTS_MEDICINE = 'Medicina esportiva',
  PHYSICAL_REHABILITATION_MEDICINE = 'Medicina física e reabilitação',
  INTENSIVE_CARE_MEDICINE = 'Medicina intensiva',
  LEGAL_MEDICINE = 'Medicina legal e perícia médica',
  NUCLEAR_MEDICINE = 'Medicina nuclear',
  PREVENTIVE_SOCIAL_MEDICINE = 'Medicina preventiva e social',
  NEPHROLOGY = 'Nefrologia',
  NEUROSURGERY = 'Neurocirurgia',
  NEUROLOGY = 'Neurologia',
  NUTROLOGY = 'Nutrologia',
  OPHTHALMOLOGY = 'Oftalmologia',
  CLINICAL_ONCOLOGY = 'Oncologia clínica',
  ORTHOPEDICS_TRAUMATOLOGY = 'Ortopedia e traumatologia',
  OTORHINOLARYNGOLOGY = 'Otorrinolaringologia',
  PATHOLOGY = 'Patologia',
  CLINICAL_PATHOLOGY = 'Patologia clínica/medicina laboratorial',
  PEDIATRICS = 'Pediatria',
  PULMONOLOGY = 'Pneumologia',
  PSYCHIATRY = 'Psiquiatria',
  RADIOLOGY_IMAGING = 'Radiologia e diagnóstico por imagem',
  RADIOTHERAPY = 'Radioterapia',
  RHEUMATOLOGY = 'Reumatologia',
  UROLOGY = 'Urologia',
}

export enum DoctorSituation {
  REGULAR = 'Regular',
  SUSPENSAO_PARCIAL_PERMANENTE = 'Suspensão parcial permanente',
  CASSADO = 'Cassado',
  INOPERANTE = 'Inoperante',
  FALECIDO = 'Falecido',
  SEM_EXERCICIO_UF = 'Sem exercício UF',
  INTERDICAO_CAUTELAR_TOTAL = 'Interdição cautelar total',
  SUSPENSO_ORDEM_JUDICIAL_PARCIAL = 'Suspenso ordem judicial parcial',
  CANCELADO = 'Cancelado',
  SUSPENSAO_TOTAL_TEMPORARIA = 'Suspensão total temporária',
  INTERDICAO_CAUTELAR_PARCIAL = 'Interdição cautelar parcial',
  SUSPENSO_ORDEM_JUDICIAL_TOTAL = 'Suspenso ordem judicial total',
  APOSENTADO = 'Aposentado',
  SUSPENSAO_TEMPORARIA = 'Suspensão temporária',
  SUSPENSO_TOTAL = 'Suspenso total',
  TRANSFERIDO = 'Transferido',
  SUSPENSO_PARCIAL = 'Suspenso parcial',
}

export enum DoctorRegistrationType {
  PRINCIPAL = 'Principal',
  SECUNDARIA = 'Secundária',
  PROVISORIA = 'Provisória',
  TEMPORARIA = 'Temporária',
  ESTUDANTE_ESTRANGEIRO = 'Estudante estrangeiro',
}

export enum BrazilianState {
  AC = 'AC',
  AL = 'AL',
  AP = 'AP',
  AM = 'AM',
  BA = 'BA',
  CE = 'CE',
  DF = 'DF',
  ES = 'ES',
  GO = 'GO',
  MA = 'MA',
  MT = 'MT',
  MS = 'MS',
  MG = 'MG',
  PA = 'PA',
  PB = 'PB',
  PR = 'PR',
  PE = 'PE',
  PI = 'PI',
  RJ = 'RJ',
  RN = 'RN',
  RS = 'RS',
  RO = 'RO',
  RR = 'RR',
  SC = 'SC',
  SP = 'SP',
  SE = 'SE',
  TO = 'TO',
}

/**
 * Tipos de instituições médicas
 * 
 * @swagger
 * @enum {string}
 */
export enum MedicalInstitutionType {
  CONSULTORIO_CLINICA = 'Consultório / Clínica',
  ATENCAO_PRIMARIA = 'Atenção Primária',
  HOSPITAL_GERAL = 'Hospital Geral',
  HOSPITAL_ESPECIALIZADO = 'Hospital Especializado',
  URGENCIA_EMERGENCIA = 'Urgência / Emergência',
  DIAGNOSTICO_POR_IMAGEM = 'Diagnóstico por Imagem',
  LABORATORIO = 'Laboratório',
  SADT_DIAGNOSE_TERAPIA = 'SADT / Diagnose e Terapia',
  BANCOS_HEMOTERAPIA = 'Bancos / Hemoterapia',
  DOMICILIAR = 'Domiciliar',
  REGULACAO_GESTAO_ADMINISTRATIVO = 'Regulação / Gestão / Administrativo',
  PERICIA = 'Perícia',
  OUTROS = 'Outros',
}

export enum CompanyType {

  HEADQUARTERS = 'Matriz',
  BRANCH = 'Filial',

}