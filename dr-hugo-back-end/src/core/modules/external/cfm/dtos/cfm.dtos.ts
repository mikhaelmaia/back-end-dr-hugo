export interface CfmConsultRequest {
  crm: number;
  uf: string;
  chave: string;
}

export interface CfmValidateRequest {
  crm: number;
  uf: string;
  cpf: string;
  dataNascimento: string;
  chave: string;
}

export interface CfmDoctorData {
  nome: string;
  crm: number;
  uf: string;
  situacao: string;
  tipoInscricao: string;
  especialidades: string[];
  dataAtualizacao: string;
}

export interface CfmValidationResult {
  valido: boolean;
}

export interface CfmErrorDto {
  status: 'ERROR';
  message: string;
  code?: string;
}

export interface CfmServiceResponse<T> {
  success: boolean;
  doctorData?: T;
  error?: CfmErrorDto;
}