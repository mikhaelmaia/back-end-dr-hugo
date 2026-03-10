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
    message:
      'Escreva a senha com no mínimo 8 caracteres, um número, uma letra maiúscula e um caractere especial (ex: !#$%@).',
    httpStatus: 400,
  } as ErrorDefinition,

  E015: {
    code: 'E015',
    name: 'PASSWORDMISSINGUPPERCASE',
    message:
      'Escreva a senha com no mínimo 8 caracteres, um número, uma letra maiúscula e um caractere especial (ex: !#$%@).',
    httpStatus: 400,
  } as ErrorDefinition,

  E016: {
    code: 'E016',
    name: 'PASSWORDMISSINGNUMBER',
    message:
      'Escreva a senha com no mínimo 8 caracteres, um número, uma letra maiúscula e um caractere especial (ex: !#$%@).',
    httpStatus: 400,
  } as ErrorDefinition,

  E017: {
    code: 'E017',
    name: 'PASSWORDMISSINGSPECIAL_CHAR',
    message:
      'Escreva a senha com no mínimo 8 caracteres, um número, uma letra maiúscula e um caractere especial (ex: !#$%@).',
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
    message:
      'Você deve aceitar os Termos de Uso e a Política de Privacidade para continuar.',
    httpStatus: 400,
  } as ErrorDefinition,

  E021: {
    code: 'E021',
    name: 'PRIVACYPOLICYNOT_ACCEPTED',
    message:
      'Você deve aceitar os Termos de Uso e a Política de Privacidade para continuar.',
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
    message:
      'E-mail, ou CPF ou senha incorreto(s). Por favor, tente novamente.',
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
    message:
      'Token de recuperação inválido ou expirado. Solicite um novo código.',
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
    message:
      'Você atingiu o limite de reenvios por dia. Aguarde 24h para um novo reenvio ou fale com o suporte.',
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
    message:
      'Serviço temporariamente indisponível. Tente novamente em alguns instantes.',
    httpStatus: 503,
  } as ErrorDefinition,

  E052: {
    code: 'E052',
    name: 'EMPTY_CNPJ',
    message: 'CNPJ é obrigatório.',
    httpStatus: 400,
  } as ErrorDefinition,

  E053: {
    code: 'E053',
    name: 'INVALID_CNPJ',
    message: 'CNPJ inválido. Verifique os números digitados.',
    httpStatus: 400,
  } as ErrorDefinition,

  E054: {
    code: 'E054',
    name: 'CNPJ_ALREADY_EXISTS',
    message:
      'Esta instituição já está cadastrada. Entre em contato com o suporte.',
    httpStatus: 409,
  } as ErrorDefinition,

  E055: {
    code: 'E055',
    name: 'RECEITA_API_ERROR',
    message:
      'Não foi possível buscar os dados automaticamente. Preencha manualmente.',
    httpStatus: 503,
  } as ErrorDefinition,

  E056: {
    code: 'E056',
    name: 'EMPTY_CNES',
    message: 'CNES é obrigatório.',
    httpStatus: 400,
  } as ErrorDefinition,

  E057: {
    code: 'E057',
    name: 'INVALID_CNES_LENGTH',
    message: 'O CNES deve conter exatamente 7 dígitos.',
    httpStatus: 400,
  } as ErrorDefinition,

  E058: {
    code: 'E058',
    name: 'EMPTY_INSTITUTION_TYPE',
    message: 'Selecione o tipo da instituição.',
    httpStatus: 400,
  } as ErrorDefinition,

  E059: {
    code: 'E059',
    name: 'EMPTY_OTHER_DESCRIPTION',
    message: 'Descreva o tipo da instituição.',
    httpStatus: 400,
  } as ErrorDefinition,

  E060: {
    code: 'E060',
    name: 'EMPTY_COUNCIL_NUMBER',
    message: 'Número do conselho é obrigatório.',
    httpStatus: 400,
  } as ErrorDefinition,

  E061: {
    code: 'E061',
    name: 'EMPTY_COUNCIL_UF',
    message: 'Selecione a UF do conselho.',
    httpStatus: 400,
  } as ErrorDefinition,

  E062: {
    code: 'E062',
    name: 'EMPTY_CRM',
    message: 'CRM é obrigatório.',
    httpStatus: 400,
  } as ErrorDefinition,

  E063: {
    code: 'E063',
    name: 'INVALID_CRM_FORMAT',
    message: 'CRM inválido (apenas números).',
    httpStatus: 400,
  } as ErrorDefinition,

  E064: {
    code: 'E064',
    name: 'EMPTY_CRM_UF',
    message: 'Selecione o Estado (UF) do CRM.',
    httpStatus: 400,
  } as ErrorDefinition,

  E065: {
    code: 'E065',
    name: 'CRM_ALREADY_EXISTS',
    message: 'Este CRM já possui cadastro na plataforma.',
    httpStatus: 409,
  } as ErrorDefinition,

  E066: {
    code: 'E066',
    name: 'EMPTY_SPECIALTY',
    message: 'Selecione a especialidade ou marque "Médico Generalista".',
    httpStatus: 400,
  } as ErrorDefinition,

  E067: {
    code: 'E067',
    name: 'EMPTY_RQE',
    message: 'O número do RQE é obrigatório para a especialidade selecionada.',
    httpStatus: 400,
  } as ErrorDefinition,

  E068: {
    code: 'E068',
    name: 'MAX_SPECIALTIES_EXCEEDED',
    message: 'É permitido cadastrar no máximo 2 especialidades.',
    httpStatus: 400,
  } as ErrorDefinition,

  E069: {
    code: 'E069',
    name: 'DUPLICATE_SPECIALTY',
    message: 'Você já selecionou esta especialidade.',
    httpStatus: 400,
  } as ErrorDefinition,

  E070: {
    code: 'E070',
    name: 'CFM_DATA_MISMATCH',
    message:
      'Os dados informados não conferem com o registro no CFM. Verifique o CRM/UF.',
    httpStatus: 409,
  } as ErrorDefinition,

  E071: {
    code: 'E071',
    name: 'CFM_API_ERROR',
    message: 'Não foi possível validar seu CRM no momento. Tente novamente.',
    httpStatus: 503,
  } as ErrorDefinition,

  E072: {
    code: 'E072',
    name: 'MAIL_CLIENT_UNAVAILABLE',
    message:
      'Não detectamos um programa de e-mail padrão. Envie para: suporte@doutorviu.com.br',
    httpStatus: 500,
  } as ErrorDefinition,

  E073: {
    code: 'E073',
    name: 'PROFILE_IMAGE_LOAD_FAILED',
    message: 'Erro ao carregar imagem de perfil.',
    httpStatus: 404,
  } as ErrorDefinition,

  E074: {
    code: 'E074',
    name: 'PROFILE_DATA_FETCH_ERROR',
    message: 'Não foi possível carregar seu perfil.',
    httpStatus: 500,
  } as ErrorDefinition,

  E075: {
    code: 'E075',
    name: 'MISSING_DISPLAY_NAME',
    message: 'Nome de exibição não encontrado.',
    httpStatus: 200,
  } as ErrorDefinition,

  E076: {
    code: 'E076',
    name: 'INSTITUTION_NAME_FALLBACK',
    message: 'Nome da instituição não definido.',
    httpStatus: 200,
  } as ErrorDefinition,

  E077: {
    code: 'E077',
    name: 'SESSION_EXPIRED_SIDEBAR',
    message: 'Sessão expirada. Faça login novamente.',
    httpStatus: 401,
  } as ErrorDefinition,

  E078: {
    code: 'E078',
    name: 'INVALID_FILE_TYPE',
    message: 'Formato inválido. Use JPG/ JPEG ou PNG.',
    httpStatus: 400,
  } as ErrorDefinition,

  E079: {
    code: 'E079',
    name: 'FILE_TOO_LARGE',
    message: 'A imagem deve ter no máximo 5MB.',
    httpStatus: 400,
  } as ErrorDefinition,

  E080: {
    code: 'E080',
    name: 'UPLOAD_FAILED',
    message: 'Erro ao salvar a imagem. Tente novamente.',
    httpStatus: 500,
  } as ErrorDefinition,

  E081: {
    code: 'E081',
    name: 'SAME_EMAIL_AS_CURRENT',
    message: 'O novo e-mail deve ser diferente do atual.',
    httpStatus: 400,
  } as ErrorDefinition,

  E082: {
    code: 'E082',
    name: 'SAME_PHONE_AS_CURRENT',
    message: 'O novo telefone deve ser diferente do atual.',
    httpStatus: 400,
  } as ErrorDefinition,

  E083: {
    code: 'E083',
    name: 'PHONE_VERIFICATION_FAILED',
    message: 'Código de verificação inválido ou expirado.',
    httpStatus: 400,
  } as ErrorDefinition,

  E084: {
    code: 'E084',
    name: 'PHONE_SEND_FAILED',
    message: 'Erro ao enviar SMS/WhatsApp. Tente novamente.',
    httpStatus: 500,
  } as ErrorDefinition,

  E085: {
    code: 'E085',
    name: 'EMPTY_MANDATORY_DETAIL',
    message: 'Por favor, descreva os detalhes já que respondeu "Sim".',
    httpStatus: 400,
  } as ErrorDefinition,

  E086: {
    code: 'E086',
    name: 'TEXT_TOO_LONG',
    message: 'O texto excede o limite de caracteres permitido.',
    httpStatus: 400,
  } as ErrorDefinition,

  E087: {
    code: 'E087',
    name: 'TERMS_NOT_ACCEPTED_RECORD',
    message: 'Você precisa confirmar a veracidade das informações.',
    httpStatus: 400,
  } as ErrorDefinition,

  E088: {
    code: 'E088',
    name: 'MEDICAL_RECORD_SAVE_ERROR',
    message: 'Erro ao salvar sua ficha. Tente novamente.',
    httpStatus: 500,
  } as ErrorDefinition,

  E091: {
    code: 'E091',
    name: 'MAX_ACTIVE_SPECIALTIES',
    message:
      'Você já possui 2 especialidades ativas. Desative uma para ativar outra.',
    httpStatus: 400,
  } as ErrorDefinition,

  E092: {
    code: 'E092',
    name: 'RQE_REQUIRED_ACTIVATION',
    message: 'Para ativar esta especialidade, informe o RQE.',
    httpStatus: 400,
  } as ErrorDefinition,

  E093: {
    code: 'E093',
    name: 'INVALID_RQE_FORMAT',
    message: 'O RQE deve conter apenas números.',
    httpStatus: 400,
  } as ErrorDefinition,

  E094: {
    code: 'E094',
    name: 'CFM_SYNC_CONNECTION_ERROR',
    message: 'Não foi possível conectar ao CFM. Tente novamente.',
    httpStatus: 503,
  } as ErrorDefinition,

  E095: {
    code: 'E095',
    name: 'CFM_NO_NEW_DATA',
    message: 'Nenhuma nova especialidade encontrada no CFM.',
    httpStatus: 200,
  } as ErrorDefinition,

  E096: {
    code: 'E096',
    name: 'CFM_SYNC_GENERIC_ERROR',
    message: 'Erro ao atualizar seus dados. Clique em "Falar com o suporte".',
    httpStatus: 500,
  } as ErrorDefinition,

  E097: {
    code: 'E097',
    name: 'SPECIALTY_SAVE_ERROR',
    message: 'Erro ao salvar as alterações. Tente novamente.',
    httpStatus: 500,
  } as ErrorDefinition,

  E098: {
    code: 'E098',
    name: 'LOGOUT_FAILED',
    message: 'Erro ao fazer logout. Tente novamente.',
    httpStatus: 500,
  } as ErrorDefinition,

  E100: {
    code: 'E100',
    name: 'EMPTY_DOCUMENT_TYPE',
    message: 'Selecione o tipo do documento.',
    httpStatus: 400,
  } as ErrorDefinition,

  E101: {
    code: 'E101',
    name: 'EMPTY_DOCUMENT_DESC',
    message: 'A descrição do documento é obrigatória.',
    httpStatus: 400,
  } as ErrorDefinition,

  E102: {
    code: 'E102',
    name: 'EMPTY_EXAM_DATE',
    message: 'A data do exame/documento é obrigatória.',
    httpStatus: 400,
  } as ErrorDefinition,

  E103: {
    code: 'E103',
    name: 'INVALID_EXAM_DATE',
    message: 'Data inválida. Verifique o dia, mês e ano.',
    httpStatus: 400,
  } as ErrorDefinition,

  E104: {
    code: 'E104',
    name: 'EXAM_DATE_IN_FUTURE',
    message: 'A data do documento não pode ser futura.',
    httpStatus: 400,
  } as ErrorDefinition,

  E105: {
    code: 'E105',
    name: 'MAX_FILES_EXCEEDED',
    message: 'Você só pode enviar até 20 arquivos de uma vez.',
    httpStatus: 400,
  } as ErrorDefinition,

  E106: {
    code: 'E106',
    name: 'HEIC_CONVERSION_ERROR',
    message: 'Erro ao processar a imagem HEIC. Tente enviar em JPG ou PNG.',
    httpStatus: 422,
  } as ErrorDefinition,

  E107: {
    code: 'E107',
    name: 'EMPTY_FILE_SELECTION',
    message: 'Selecione pelo menos um arquivo para enviar.',
    httpStatus: 400,
  } as ErrorDefinition,

  E108: {
    code: 'E108',
    name: 'DUPLICATE_FILENAME',
    message: 'Você já selecionou um arquivo com este nome.',
    httpStatus: 400,
  } as ErrorDefinition,

  E109: {
    code: 'E109',
    name: 'TUSS_SEARCH_FAILED',
    message:
      'Não foi possível carregar a lista de exames. Digite o nome manualmente.',
    httpStatus: 503,
  } as ErrorDefinition,

  E110: {
    code: 'E110',
    name: 'DOCUMENT_DELETE_ERROR',
    message: 'Erro ao excluir o documento. Tente novamente.',
    httpStatus: 500,
  } as ErrorDefinition,

  E111: {
    code: 'E111',
    name: 'DOCUMENT_NOT_FOUND',
    message: 'Documento não encontrado ou já excluído.',
    httpStatus: 404,
  } as ErrorDefinition,

  E112: {
    code: 'E112',
    name: 'UNAUTHORIZED_DOCUMENT',
    message: 'Você não tem permissão para acessar este documento.',
    httpStatus: 403,
  } as ErrorDefinition,

  E117: {
    code: 'E117',
    name: 'DUPLICATE_DOCUMENT_NAME',
    message: 'Você já possui um documento com este nome. Escolha outro.',
    httpStatus: 409,
  } as ErrorDefinition,

  E118: {
    code: 'E118',
    name: 'DOCUMENT_DOWNLOAD_ERROR',
    message: 'Erro ao baixar o documento. Tente novamente mais tarde.',
    httpStatus: 500,
  } as ErrorDefinition,

  E119: {
    code: 'E119',
    name: 'FILTER_LOAD_ERROR',
    message: 'Não foi possível carregar as opções de filtro no momento.',
    httpStatus: 503,
  } as ErrorDefinition,

  E120: {
    code: 'E120',
    name: 'DOCUMENT_UPDATE_ERROR',
    message: 'Erro ao salvar as alterações. Tente novamente.',
    httpStatus: 500,
  } as ErrorDefinition,

  E121: {
    code: 'E121',
    name: 'DOCUMENT_LOAD_ERROR',
    message: 'Erro ao carregar os arquivos do documento. Tente novamente.',
    httpStatus: 500,
  } as ErrorDefinition,

  E122: {
    code: 'E122',
    name: 'ZIP_CREATION_FAILED',
    message: 'Erro ao compactar os arquivos. Tente baixá-los individualmente.',
    httpStatus: 500,
  } as ErrorDefinition,

  E123: {
    code: 'E123',
    name: 'FILE_NOT_FOUND_IN_STORAGE',
    message: 'O arquivo físico não foi encontrado no servidor.',
    httpStatus: 404,
  } as ErrorDefinition,

  E124: {
    code: 'E124',
    name: 'EMPTY_SHARE_SELECTION',
    message: 'Selecione pelo menos um documento para compartilhar.',
    httpStatus: 400,
  } as ErrorDefinition,

  E125: {
    code: 'E125',
    name: 'QR_CODE_GENERATION_FAILED',
    message: 'Erro ao gerar o QR Code de acesso. Tente novamente.',
    httpStatus: 500,
  } as ErrorDefinition,

  E126: {
    code: 'E126',
    name: 'SHARE_SESSION_NOT_FOUND',
    message: 'Sessão de compartilhamento inválida ou não encontrada.',
    httpStatus: 404,
  } as ErrorDefinition,
} as const;

export type ErrorCode = keyof typeof ERRORS;
export type ErrorName = (typeof ERRORS)[ErrorCode]['name'];

export const ERROR_CODES = Object.keys(ERRORS) as Array<ErrorCode>;
export const ERROR_NAMES = Object.values(ERRORS).map((error) => error.name);
