export interface CompanyActivityDto {
  code: string;
  text: string;
}

export interface CompanyQsaDto {
  nome: string;
  qual: string;
  pais_origem?: string;
  nome_rep_legal?: string;
  qual_rep_legal?: string;
}

export interface CompanyBillingDto {
  free: boolean;
  database: boolean;
}

export interface CompanyDto {
  atividade_principal: CompanyActivityDto[];
  data_situacao: string;
  tipo: string;
  nome: string;
  uf: string;
  telefone: string;
  atividades_secundarias: CompanyActivityDto[];
  qsa: CompanyQsaDto[];
  situacao: string;
  bairro: string;
  logradouro: string;
  numero: string;
  cep: string;
  municipio: string;
  porte: string;
  abertura: string;
  natureza_juridica: string;
  fantasia?: string;
  cnpj: string;
  ultima_atualizacao: string;
  status: string;
  complemento?: string;
  email?: string;
  efr?: string;
  motivo_situacao?: string;
  situacao_especial?: string;
  data_situacao_especial?: string;
  capital_social?: string;
  extra?: Record<string, any>;
  billing?: CompanyBillingDto;
}

export interface ReceitaWsErrorDto {
  status: string;
  message: string;
  code?: string;
}

export interface ReceitaWsResponseDto {
  success: boolean;
  companyData?: CompanyDto;
  error?: ReceitaWsErrorDto;
}