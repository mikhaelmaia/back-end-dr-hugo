import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InstitutionValidationData {

    @ApiProperty({
        description: 'Tipo da instituição',
        example: 'HOSPITAL'
    })
    public type: string;

    @ApiProperty({
        description: 'Tamanho da empresa',
        example: 'GRANDE'
    })
    public size: string;

    @ApiProperty({
        description: 'Nome da instituição',
        example: 'Hospital São João'
    })
    public name: string;

    @ApiPropertyOptional({
        description: 'Nome fantasia da instituição',
        example: 'Hospital São João - Unidade Centro'
    })
    public fantasyName?: string;

    @ApiPropertyOptional({
        description: 'Atividades principais da instituição',
        example: ['Atendimento médico', 'Cirurgias']
    })
    public mainActivities?: string[];

    @ApiPropertyOptional({
        description: 'Atividades secundárias da instituição',
        example: ['Laboratório', 'Farmácia']
    })
    public secondaryActivities?: string[];

    @ApiPropertyOptional({
        description: 'Natureza jurídica da instituição',
        example: 'Empresa Privada'
    })
    public legalNature?: string;

    @ApiProperty({
        description: 'CEP do endereço',
        example: '12345678'
    })
    public zipCode: string;

    @ApiProperty({
        description: 'Nome da rua',
        example: 'Rua das Flores'
    })
    public street: string;

    @ApiProperty({
        description: 'Número do endereço',
        example: '123'
    })
    public number: string;

    @ApiPropertyOptional({
        description: 'Complemento do endereço',
        example: 'Bloco A, Sala 101'
    })
    public complement?: string;

    @ApiProperty({
        description: 'Bairro do endereço',
        example: 'Centro'
    })
    public neighborhood: string;

    @ApiProperty({
        description: 'Cidade do endereço',
        example: 'São Paulo'
    })
    public city: string;

    @ApiProperty({
        description: 'Estado do endereço',
        example: 'SP'
    })
    public state: string;

    @ApiPropertyOptional({
        description: 'Nome do representante legal',
        example: 'Dr. João Silva'
    })
    public legalRepresentativeName?: string;

    @ApiPropertyOptional({
        description: 'Qualificação do representante legal',
        example: 'Diretor Clínico'
    })
    public legalRepresentativeQualification?: string;

    @ApiProperty({
        description: 'Situação da empresa na Receita Federal',
        example: 'ATIVA'
    })
    public situation: string;

}

export class InstitutionValidatedDto {

    @ApiProperty({
        description: 'Indica se a validação da instituição foi bem-sucedida',
        example: true,
        type: Boolean
    })
    public valid: boolean;

    @ApiProperty({
        description: 'Dados da instituição validados',
        type: InstitutionValidationData
    })
    public data: InstitutionValidationData;

    @ApiProperty({
        description: 'Mensagem informativa sobre o resultado da validação',
        example: 'Instituição validada com sucesso',
        type: String
    })
    public message: string;

}