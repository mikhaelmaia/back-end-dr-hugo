export interface CnesEstablishmentDto {
  codigo_cnes?: number;
  numero_cnpj_entidade?: string;
  nome_razao_social?: string;
  nome_fantasia?: string;
  natureza_organizacao_entidade?: string;
  tipo_gestao?: string;
  descricao_nivel_hierarquia?: string;
  descricao_esfera_administrativa?: string;
  codigo_tipo_unidade?: number;
  codigo_cep_estabelecimento?: string;
  endereco_estabelecimento?: string;
  numero_estabelecimento?: string;
  bairro_estabelecimento?: string;
  numero_telefone_estabelecimento?: string;
  latitude_estabelecimento_decimo_grau?: number;
  longitude_estabelecimento_decimo_grau?: number;
  endereco_email_estabelecimento?: string;
  numero_cnpj?: string;
  codigo_identificador_turno_atendimento?: string;
  descricao_turno_atendimento?: string;
  estabelecimento_faz_atendimento_ambulatorial_sus?: string;
  codigo_estabelecimento_saude?: string;
  codigo_uf?: number;
  codigo_municipio?: number;
  descricao_natureza_juridica_estabelecimento?: string;
  codigo_motivo_desabilitacao_estabelecimento?: string;
  estabelecimento_possui_centro_cirurgico?: number;
  estabelecimento_possui_centro_obstetrico?: number;
  estabelecimento_possui_centro_neonatal?: number;
  estabelecimento_possui_atendimento_hospitalar?: number;
  estabelecimento_possui_servico_apoio?: number;
  estabelecimento_possui_atendimento_ambulatorial?: number;
  codigo_atividade_ensino_unidade?: string;
  codigo_natureza_organizacao_unidade?: string;
  codigo_nivel_hierarquia_unidade?: string;
  codigo_esfera_administrativa_unidade?: string;
  data_atualizacao?: string;
}

export interface CnesErrorDto {
  status: string;
  message: string;
  code?: string;
}

export interface CnesResponseDto {
  success: boolean;
  establishmentData?: CnesEstablishmentDto;
  error?: CnesErrorDto;
}
