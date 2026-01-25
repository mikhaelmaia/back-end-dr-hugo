export interface ErrorDefinition {
  code: string;
  name: string;
  message: string;
  httpStatus: number;
}

export const ERRORS = {
  E001: {
    code: 'E001',
    name: 'EMPTYFULLNAME',
    message: 'Nome completo é obrigatório.',
    httpStatus: 400,
  } as ErrorDefinition,

  E002: {
    code: 'E002',
    name: 'INVALIDFULLNAME_FORMAT',
    message: 'Nome não pode conter números.',
    httpStatus: 400,
  } as ErrorDefinition,

  E003: {
    code: 'E003',
    name: 'FULLNAMETOO_SHORT',
    message: 'Nome precisa ter no mínimo uma letra.',
    httpStatus: 400,
  } as ErrorDefinition,

  E004: {
    code: 'E004',
    name: 'EMPTY_CPF',
    message: 'CPF é obrigatório.',
    httpStatus: 400,
  } as ErrorDefinition,

  E005: {
    code: 'E005',
    name: 'INVALID_CPF',
    message: 'CPF inválido. Verifique o formato.',
    httpStatus: 400,
  } as ErrorDefinition,

  E006: {
    code: 'E006',
    name: 'EMPTY_EMAIL',
    message: 'E-mail é obrigatório.',
    httpStatus: 400,
  } as ErrorDefinition,

  E007: {
    code: 'E007',
    name: 'INVALIDEMAILFORMAT',
    message: 'Digite um e-mail válido. Exemplo de e-mail: seu@email.com',
    httpStatus: 400,
  } as ErrorDefinition,

  E008: {
    code: 'E008',
    name: 'EMPTYBIRTHDATE',
    message: 'Data de nascimento é obrigatória.',
    httpStatus: 400,
  } as ErrorDefinition,

  E009: {
    code: 'E009',
    name: 'INVALIDBIRTHDATE_FORMAT',
    message: 'Data de nascimento deve estar no formato DD/MM/AAAA.',
    httpStatus: 400,
  } as ErrorDefinition,

  E010: {
    code: 'E010',
    name: 'INVALIDBIRTHDATE',
    message: 'Data de nascimento inválida.',
    httpStatus: 400,
  } as ErrorDefinition,

  E011: {
    code: 'E011',
    name: 'EMPTY_PHONE',
    message: 'Telefone é obrigatório.',
    httpStatus: 400,
  } as ErrorDefinition,

  E012: {
    code: 'E012',
    name: 'INVALIDPHONEFORMAT',
    message: 'Telefone inválido. Exemplo: (11) 99999-9999',
    httpStatus: 400,
  } as ErrorDefinition,

  E013: {
    code: 'E013',
    name: 'EMPTY_PASSWORD',
    message: 'Senha é obrigatória.',
    httpStatus: 400,
  } as ErrorDefinition,

  E014: {
    code: 'E014',
    name: 'PASSWORDTOOSHORT',
    message: 'Escreva a senha com no mínimo 8 caracteres, um número, uma letra maiúscula e um caractere especial (ex: !#$%@).',
    httpStatus: 400,
  } as ErrorDefinition,

  E015: {
    code: 'E015',
    name: 'PASSWORDMISSINGUPPERCASE',
    message: 'Escreva a senha com no mínimo 8 caracteres, um número, uma letra maiúscula e um caractere especial (ex: !#$%@).',
    httpStatus: 400,
  } as ErrorDefinition,

  E016: {
    code: 'E016',
    name: 'PASSWORDMISSINGNUMBER',
    message: 'Escreva a senha com no mínimo 8 caracteres, um número, uma letra maiúscula e um caractere especial (ex: !#$%@).',
    httpStatus: 400,
  } as ErrorDefinition,

  E017: {
    code: 'E017',
    name: 'PASSWORDMISSINGSPECIAL_CHAR',
    message: 'Escreva a senha com no mínimo 8 caracteres, um número, uma letra maiúscula e um caractere especial (ex: !#$%@).',
    httpStatus: 400,
  } as ErrorDefinition,

  E018: {
    code: 'E018',
    name: 'EMPTYPASSWORDCONFIRMATION',
    message: 'Confirmação de senha é obrigatória.',
    httpStatus: 400,
  } as ErrorDefinition,

  E019: {
    code: 'E019',
    name: 'PASSWORD_MISMATCH',
    message: 'As senhas devem ser iguais.',
    httpStatus: 400,
  } as ErrorDefinition,

  E020: {
    code: 'E020',
    name: 'TERMSNOTACCEPTED',
    message: 'Você deve aceitar os Termos de Uso e a Política de Privacidade para continuar.',
    httpStatus: 400,
  } as ErrorDefinition,

  E021: {
    code: 'E021',
    name: 'PRIVACYPOLICYNOT_ACCEPTED',
    message: 'Você deve aceitar os Termos de Uso e a Política de Privacidade para continuar.',
    httpStatus: 400,
  } as ErrorDefinition,

  E022: {
    code: 'E022',
    name: 'INVALID_VERIFICATION_TOKEN',
    message: 'Link de verificação inválido ou expirado.',
    httpStatus: 400,
  } as ErrorDefinition,

  E023: {
    code: 'E023',
    name: 'EMPTYEMAILOR_CPF',
    message: 'E-mail ou CPF é obrigatório.',
    httpStatus: 400,
  } as ErrorDefinition,

  E024: {
    code: 'E024',
    name: 'INVALIDEMAILORCPFFORMAT',
    message: 'E-mail, ou CPF ou senha incorreto(s). Por favor, tente novamente.',
    httpStatus: 400,
  } as ErrorDefinition,

  E025: {
    code: 'E025',
    name: 'EMPTY_RESET_CODE',
    message: 'Código é obrigatório.',
    httpStatus: 400,
  } as ErrorDefinition,

  E026: {
    code: 'E026',
    name: 'INVALID_OR_EXPIRED_CODE',
    message: 'O código digitado é inválido ou expirou. Reenvie o código.',
    httpStatus: 400,
  } as ErrorDefinition,

  E027: {
    code: 'E027',
    name: 'CODE_ALREADY_USED',
    message: 'Este código já foi utilizado. Solicite um novo código.',
    httpStatus: 400,
  } as ErrorDefinition,

  E028: {
    code: 'E028',
    name: 'INVALID_RESET_TOKEN',
    message: 'Token de recuperação inválido ou expirado. Solicite um novo código.',
    httpStatus: 400,
  } as ErrorDefinition,

  E029: {
    code: 'E029',
    name: 'INVALID_CREDENTIALS',
    message: 'E-mail, CPF ou senha incorreto(s). Por favor, tente novamente.',
    httpStatus: 401,
  } as ErrorDefinition,

  E030: {
    code: 'E030',
    name: 'USERNOTFOUND',
    message: 'E-mail, CPF ou senha incorreto(s). Por favor, tente novamente.',
    httpStatus: 401,
  } as ErrorDefinition,

  E031: {
    code: 'E031',
    name: 'ACCOUNTPENDINGVERIFICATION',
    message: 'Sua conta está aguardando verificação. Confirme o seu e-mail.',
    httpStatus: 403,
  } as ErrorDefinition,

  E032: {
    code: 'E032',
    name: 'ACCOUNT_INACTIVE',
    message: 'Sua conta está inativa. Entre em contato com o suporte.',
    httpStatus: 403,
  } as ErrorDefinition,

  E033: {
    code: 'E033',
    name: 'USER_NOT_FOUND',
    message: 'Usuário não encontrado.',
    httpStatus: 404,
  } as ErrorDefinition,

  E034: {
    code: 'E034',
    name: 'CPFALREADYEXISTS',
    message: 'CPF já cadastrado no sistema.',
    httpStatus: 409,
  } as ErrorDefinition,

  E035: {
    code: 'E035',
    name: 'EMAILALREADYEXISTS',
    message: 'E-mail já cadastrado no sistema.',
    httpStatus: 409,
  } as ErrorDefinition,

  E036: {
    code: 'E036',
    name: 'EMAIL_ALREADY_VERIFIED',
    message: 'Este e-mail já foi confirmado. Você pode fazer login.',
    httpStatus: 409,
  } as ErrorDefinition,

  E037: {
    code: 'E037',
    name: 'EXPIRED_VERIFICATION_TOKEN',
    message: 'Link de verificação expirado. Solicite um novo e-mail.',
    httpStatus: 410,
  } as ErrorDefinition,

  E038: {
    code: 'E038',
    name: 'RESEND_TOO_SOON',
    message: 'Aguarde 60 segundos antes de solicitar um novo e-mail.',
    httpStatus: 429,
  } as ErrorDefinition,

  E039: {
    code: 'E039',
    name: 'CODE_RESEND_COOLDOWN',
    message: 'Aguarde 60s para reenviar.',
    httpStatus: 429,
  } as ErrorDefinition,

  E040: {
    code: 'E040',
    name: 'TOO_MANY_CODE_ATTEMPTS',
    message: 'Muitas tentativas incorretas. Tente novamente em 5 minutos.',
    httpStatus: 429,
  } as ErrorDefinition,

  E041: {
    code: 'E041',
    name: 'MAX_RESEND_LIMIT_REACHED',
    message: 'Você atingiu o limite de reenvios por dia. Aguarde 24h para um novo reenvio ou fale com o suporte.',
    httpStatus: 429,
  } as ErrorDefinition,

  E042: {
    code: 'E042',
    name: 'TOOMANYLOGIN_ATTEMPTS',
    message: 'Muitas tentativas de login. Tente novamente em 1 minuto.',
    httpStatus: 429,
  } as ErrorDefinition,

  E043: {
    code: 'E043',
    name: 'REGISTRATION_FAILED',
    message: 'Erro ao cadastrar-se. Tente novamente mais tarde.',
    httpStatus: 500,
  } as ErrorDefinition,

  E044: {
    code: 'E044',
    name: 'DATABASE_ERROR',
    message: 'Erro ao processar sua solicitação. Tente novamente mais tarde.',
    httpStatus: 500,
  } as ErrorDefinition,

  E045: {
    code: 'E045',
    name: 'NAVIGATION_ERROR',
    message: 'Erro ao carregar a página. Tente novamente.',
    httpStatus: 500,
  } as ErrorDefinition,

  E046: {
    code: 'E046',
    name: 'EMAIL_SEND_FAILED',
    message: 'Erro ao enviar e-mail de confirmação. Tente novamente.',
    httpStatus: 500,
  } as ErrorDefinition,

  E047: {
    code: 'E047',
    name: 'RESET_CODE_SEND_FAILED',
    message: 'Erro ao enviar código de recuperação. Tente novamente.',
    httpStatus: 500,
  } as ErrorDefinition,

  E048: {
    code: 'E048',
    name: 'CODE_VALIDATION_FAILED',
    message: 'Erro ao validar código. Tente novamente mais tarde.',
    httpStatus: 500,
  } as ErrorDefinition,

  E049: {
    code: 'E049',
    name: 'PASSWORD_RESET_FAILED',
    message: 'Erro ao redefinir senha. Tente novamente mais tarde.',
    httpStatus: 500,
  } as ErrorDefinition,

  E050: {
    code: 'E050',
    name: 'LOGIN_FAILED',
    message: 'Erro ao fazer login. Tente novamente mais tarde.',
    httpStatus: 500,
  } as ErrorDefinition,
  
  E051: {
    code: 'E051',
    name: 'SERVICE_UNAVAILABLE',
    message: 'Serviço temporariamente indisponível. Tente novamente em alguns instantes.',
    httpStatus: 503,
  } as ErrorDefinition,
} as const;

export type ErrorCode = keyof typeof ERRORS;
export type ErrorName = (typeof ERRORS)[ErrorCode]['name'];

export const ERROR_CODES = Object.keys(ERRORS) as Array<ErrorCode>;
export const ERROR_NAMES = Object.values(ERRORS).map(error => error.name);