import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HealthInstitutionData {
  @ApiPropertyOptional({
    description: 'Natureza da organização da entidade',
    example: 'Associação',
  })
  public organizationNature?: string;

  @ApiPropertyOptional({
    description: 'Código da descrição da natureza jurídica do estabelecimento',
    example: '3999',
  })
  public legalNatureDescription?: string;

  @ApiPropertyOptional({
    description: 'Código do motivo de desabilitação do estabelecimento',
    example: null,
  })
  public disablingReasonCode?: string;

  @ApiPropertyOptional({
    description: 'Indica se o estabelecimento possui centro cirúrgico',
    example: false,
  })
  public hasSurgicalCenter?: boolean;

  @ApiPropertyOptional({
    description: 'Indica se o estabelecimento possui centro obstétrico',
    example: false,
  })
  public hasObstetricCenter?: boolean;

  @ApiPropertyOptional({
    description: 'Indica se o estabelecimento possui centro neonatal',
    example: false,
  })
  public hasNeonatalCenter?: boolean;

  @ApiPropertyOptional({
    description: 'Indica se o estabelecimento possui atendimento hospitalar',
    example: false,
  })
  public hasHospitalCare?: boolean;

  @ApiPropertyOptional({
    description: 'Indica se o estabelecimento possui serviços de apoio',
    example: true,
  })
  public hasSupportService?: boolean;

  @ApiPropertyOptional({
    description: 'Indica se o estabelecimento possui atendimento ambulatorial',
    example: false,
  })
  public hasOutpatientCare?: boolean;

  @ApiPropertyOptional({
    description: 'Código da atividade de ensino da unidade',
    example: '04',
  })
  public teachingActivityCode?: string;

  @ApiPropertyOptional({
    description: 'Código da natureza da organização da unidade',
    example: null,
  })
  public unitOrganizationNatureCode?: string;

  @ApiPropertyOptional({
    description: 'Código do nível hierárquico da unidade',
    example: null,
  })
  public unitHierarchyLevelCode?: string;

  @ApiPropertyOptional({
    description: 'Código da esfera administrativa da unidade',
    example: 'M ',
  })
  public unitAdministrativeSphereCode?: string;

  @ApiPropertyOptional({
    description: 'Data da última atualização dos dados',
    example: '2025-11-06',
  })
  public lastUpdateDate?: string;
}

export class CnesValidationData {
  @ApiProperty({
    description: 'CNPJ/Tax ID extraído do CNES',
    example: '60765823003902',
  })
  public taxId: string;

  @ApiProperty({
    description: 'Código CNES da instituição de saúde',
    example: '9577254',
  })
  public cnesCode: string;

  @ApiProperty({
    description: 'Nome da empresa conforme CNES',
    example: 'SOCIEDADE BENEF ISRAELITA BRAS HOSPITAL ALBERT EINSTEIN',
  })
  public companyName: string;

  @ApiProperty({
    description: 'Nome fantasia conforme CNES',
    example: 'UNIDADE EINSTEIN ALTO DE PINHEIROS',
  })
  public fantasyName: string;
}

export class CnesValidatedDto {
  @ApiProperty({
    description: 'Indica se a validação do CNES foi bem-sucedida',
    example: true,
    type: Boolean,
  })
  public valid: boolean;

  @ApiProperty({
    description: 'Indica se o CNPJ foi encontrado nos dados do CNES',
    example: true,
    type: Boolean,
  })
  public cnpjFound: boolean;

  @ApiPropertyOptional({
    description: 'Dados básicos da instituição extraídos do CNES',
    type: CnesValidationData,
  })
  public basicData?: CnesValidationData;

  @ApiPropertyOptional({
    description: 'Dados específicos de saúde do CNES',
    type: HealthInstitutionData,
  })
  public healthData?: HealthInstitutionData;

  @ApiProperty({
    description: 'Mensagem informativa sobre o resultado da validação CNES',
    example: 'Instituição encontrada no CNES com CNPJ disponível',
    type: String,
  })
  public message: string;
}

export class InstitutionValidationData {
  @ApiProperty({
    description: 'Tipo da instituição',
    example: 'HOSPITAL',
  })
  public type: string;

  @ApiProperty({
    description: 'Tamanho da empresa',
    example: 'GRANDE',
  })
  public size: string;

  @ApiProperty({
    description: 'Nome da instituição',
    example: 'Hospital São João',
  })
  public name: string;

  @ApiPropertyOptional({
    description: 'Nome fantasia da instituição',
    example: 'Hospital São João - Unidade Centro',
  })
  public fantasyName?: string;

  @ApiPropertyOptional({
    description: 'Atividades principais da instituição',
    example: ['Atendimento médico', 'Cirurgias'],
  })
  public mainActivities?: string[];

  @ApiPropertyOptional({
    description: 'Atividades secundárias da instituição',
    example: ['Laboratório', 'Farmácia'],
  })
  public secondaryActivities?: string[];

  @ApiPropertyOptional({
    description: 'Natureza jurídica da instituição',
    example: 'Empresa Privada',
  })
  public legalNature?: string;

  @ApiProperty({
    description: 'CEP do endereço',
    example: '12345678',
  })
  public zipCode: string;

  @ApiProperty({
    description: 'Nome da rua',
    example: 'Rua das Flores',
  })
  public street: string;

  @ApiProperty({
    description: 'Número do endereço',
    example: '123',
  })
  public number: string;

  @ApiPropertyOptional({
    description: 'Complemento do endereço',
    example: 'Bloco A, Sala 101',
  })
  public complement?: string;

  @ApiProperty({
    description: 'Bairro do endereço',
    example: 'Centro',
  })
  public neighborhood: string;

  @ApiProperty({
    description: 'Cidade do endereço',
    example: 'São Paulo',
  })
  public city: string;

  @ApiProperty({
    description: 'Estado do endereço',
    example: 'SP',
  })
  public state: string;

  @ApiPropertyOptional({
    description: 'Nome do representante legal',
    example: 'Dr. João Silva',
  })
  public legalRepresentativeName?: string;

  @ApiPropertyOptional({
    description: 'Qualificação do representante legal',
    example: 'Diretor Clínico',
  })
  public legalRepresentativeQualification?: string;

  @ApiProperty({
    description: 'Situação da empresa na Receita Federal',
    example: 'ATIVA',
  })
  public situation: string;
}

export class InstitutionValidatedDto {
  @ApiProperty({
    description: 'Indica se a validação da instituição foi bem-sucedida',
    example: true,
    type: Boolean,
  })
  public valid: boolean;

  @ApiProperty({
    description: 'Dados validados da instituição',
    type: InstitutionValidationData,
  })
  public data: InstitutionValidationData;

  @ApiProperty({
    description: 'Mensagem informativa sobre o resultado da validação',
    example: 'Instituição validada com sucesso',
    type: String,
  })
  public message: string;
}
