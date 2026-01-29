import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntityDto } from 'src/core/base/base.entity.dto';
import { InstitutionCompany } from '../entities/company.entity';
import { CompanyType } from 'src/core/vo/consts/enums';
import {
  provideIsNotEmptyValidationMessage,
  provideIsStringValidationMessage,
  provideMaxLengthValidationMessage,
  provideIsEnumValidationMessage,
  provideIsArrayValidationMessage,
} from 'src/core/vo/consts/validation-messages';
import { IsNotEmptyString } from 'src/core/vo/validators/is-not-empty-string.validator';
import { RepresentativeDto } from '../../representative/dtos/representative.dto';

export class CompanyDto extends BaseEntityDto<InstitutionCompany> {
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Tipo da Empresa'),
  })
  @IsEnum(CompanyType, {
    message: provideIsEnumValidationMessage('Tipo da Empresa', CompanyType),
  })
  @ApiProperty({
    description: 'Tipo de empresa médica',
    example: 'HOSPITAL',
    enum: CompanyType,
    enumName: 'CompanyType',
    type: String
  })
  public type: CompanyType;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Tamanho da Empresa'),
  })
  @IsString({
    message: provideIsStringValidationMessage('Tamanho da Empresa'),
  })
  @IsNotEmptyString({
    message: provideIsNotEmptyValidationMessage('Tamanho da Empresa'),
  })
  @MaxLength(255, {
    message: provideMaxLengthValidationMessage('Tamanho da Empresa'),
  })
  @ApiProperty({
    description: 'Classificação do tamanho da empresa (ex: Pequena, Média, Grande)',
    example: 'Grande',
    maxLength: 255,
    type: String
  })
  public size: string;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Nome da Empresa'),
  })
  @IsString({
    message: provideIsStringValidationMessage('Nome da Empresa'),
  })
  @IsNotEmptyString({
    message: provideIsNotEmptyValidationMessage('Nome da Empresa'),
  })
  @MaxLength(255, {
    message: provideMaxLengthValidationMessage('Nome da Empresa'),
  })
  @ApiProperty({
    description: 'Razão social da empresa',
    example: 'Hospital São João Ltda',
    maxLength: 255,
    type: String
  })
  public name: string;

  @IsOptional()
  @IsString({
    message: provideIsStringValidationMessage('Nome Fantasia'),
  })
  @MaxLength(255, {
    message: provideMaxLengthValidationMessage('Nome Fantasia'),
  })
  @ApiPropertyOptional({
    description: 'Nome fantasia da empresa',
    example: 'Hospital São João - Unidade Centro',
    maxLength: 255,
    type: String
  })
  public fantasyName?: string;

  @IsOptional()
  @IsArray({
    message: provideIsArrayValidationMessage('Atividades Principais'),
  })
  @IsString({
    each: true,
    message: 'Cada atividade principal deve ser um texto',
  })
  @ApiPropertyOptional({
    description: 'Lista das principais atividades desenvolvidas pela empresa',
    example: ['Atendimento médico hospitalar', 'Cirurgias de alta complexidade'],
    type: [String]
  })
  public mainActivities?: string[];

  @IsOptional()
  @IsArray({
    message: provideIsArrayValidationMessage('Atividades Secundárias'),
  })
  @IsString({
    each: true,
    message: 'Cada atividade secundária deve ser um texto',
  })
  @ApiPropertyOptional({
    description: 'Lista das atividades secundárias desenvolvidas pela empresa',
    example: ['Laboratório de análises clínicas', 'Farmácia hospitalar'],
    type: [String]
  })
  public secondaryActivities?: string[];

  @IsOptional()
  @IsString({
    message: provideIsStringValidationMessage('Natureza Jurídica'),
  })
  @MaxLength(255, {
    message: provideMaxLengthValidationMessage('Natureza Jurídica'),
  })
  @ApiPropertyOptional({
    description: 'Natureza jurídica da empresa conforme registro na Receita Federal',
    example: 'Sociedade Empresária Limitada',
    maxLength: 255,
    type: String
  })
  public legalNature?: string;

  @IsOptional()
  @IsString({
    message: provideIsStringValidationMessage('Nome do Representante Legal'),
  })
  @MaxLength(255, {
    message: provideMaxLengthValidationMessage('Nome do Representante Legal'),
  })
  @ApiPropertyOptional({
    description: 'Nome do representante legal da empresa',
    example: 'Dr. Carlos Eduardo Silva',
    maxLength: 255,
    type: String
  })
  public legalRepresentativeName?: string;

  @IsOptional()
  @IsString({
    message: provideIsStringValidationMessage('Qualificação do Representante Legal'),
  })
  @MaxLength(255, {
    message: provideMaxLengthValidationMessage('Qualificação do Representante Legal'),
  })
  @ApiPropertyOptional({
    description: 'Cargo ou qualificação do representante legal',
    example: 'Diretor Clínico',
    maxLength: 255,
    type: String
  })
  public legalRepresentativeQualification?: string;

  @ValidateNested()
  @Type(() => RepresentativeDto)
  @ApiProperty({
    description: 'Dados do representante técnico da empresa',
    type: () => RepresentativeDto
  })
  public representative: RepresentativeDto;
}
