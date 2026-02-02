import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  MaxLength,
  IsStrongPassword,
  Length,
  IsOptional,
  IsEnum,
  ValidateNested,
  ValidateIf,
  IsArray,
} from 'class-validator';
import { AddressDto } from 'src/core/modules/address/dtos/address.dto';
import { MedicalInstitutionType, TermsType } from 'src/core/vo/consts/enums';
import {
  provideIsNotEmptyValidationMessage,
  provideIsStringValidationMessage,
  provideIsEmailValidationMessage,
  provideMaxLengthValidationMessage,
  provideIsNotEmptyStringValidationMessage,
  provideLengthValidationMessage,
  provideIsValidTaxIdValidationMessage,
  provideIsEnumValidationMessage,
} from 'src/core/vo/consts/validation-messages';
import { IsNotBlacklisted } from 'src/core/vo/validators/is-not-blacklisted.validator';
import { IsNotEmptyString } from 'src/core/vo/validators/is-not-empty-string.validator';
import { IsUnique } from 'src/core/vo/validators/is-unique.validator';
import { IsUniqueComposite } from 'src/core/vo/validators/is-unique-composite.validator';
import { IsValidTaxId } from 'src/core/vo/validators/is-valid-tax-id.validator';
import { CreateInstitutionCompanyRepresentativeDto } from '../aggregates/representative/dtos/create-representative.dto';
import { ContainsRequiredTerms } from 'src/core/vo/validators/contains-required-terms.validator';

export class CreateInstitutionDto {
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('E-mail'),
  })
  @IsString({ message: provideIsStringValidationMessage('E-mail') })
  @IsEmail({}, { message: provideIsEmailValidationMessage() })
  @IsNotBlacklisted()
  @MaxLength(50, { message: provideMaxLengthValidationMessage('E-mail') })
  @IsUniqueComposite(
    {
      tableName: 'dv_user',
      column: 'email',
      additionalField: { column: 'role', value: 'INSTITUTION' },
    },
    {
      message: 'Já existe instituição com este e-mail cadastrado',
    },
  )
  @ApiProperty({
    description:
      'Endereço de e-mail da instituição médica (deve ser único no sistema)',
    example: 'contato@hospitalsaojoao.com.br',
    maxLength: 50,
    format: 'email',
    type: String,
  })
  public email: string;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Senha do Usuário'),
  })
  @IsString({ message: provideIsStringValidationMessage('Senha do Usuário') })
  @IsNotEmptyString({
    message: provideIsNotEmptyStringValidationMessage('Senha do Usuário'),
  })
  @IsStrongPassword()
  @Exclude({ toPlainOnly: true })
  @ApiProperty({
    description:
      'Senha de acesso da instituição médica (deve ser forte: minúscula, maiúscula, número e caractere especial)',
    example: 'MinhaSenh@123',
    minLength: 8,
    type: String,
    writeOnly: true,
  })
  public password: string;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('CNPJ'),
  })
  @IsString({
    message: provideIsStringValidationMessage('CNPJ'),
  })
  @Length(14, 14, { message: 'CNPJ deve ter exatamente 14 dígitos' })
  @IsNotEmptyString({
    message: provideIsNotEmptyStringValidationMessage('CNPJ'),
  })
  @IsValidTaxId({
    message: provideIsValidTaxIdValidationMessage('CNPJ'),
  })
  @IsUniqueComposite(
    {
      tableName: 'dv_user',
      column: 'taxId',
      additionalField: { column: 'role', value: 'INSTITUTION' },
    },
    {
      message: 'Já existe instituição com este CNPJ cadastrado',
    },
  )
  @ApiProperty({
    description: 'CNPJ da instituição médica (apenas números, deve ser único)',
    example: '12345678000123',
    minLength: 14,
    maxLength: 14,
    type: String,
  })
  public taxId: string;

  @IsString({
    message: provideIsStringValidationMessage('Telefone'),
  })
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Telefone'),
  })
  @Length(10, 15, { message: provideLengthValidationMessage('Telefone') })
  @IsUniqueComposite(
    {
      tableName: 'dv_user',
      column: 'phone',
      additionalField: { column: 'role', value: 'INSTITUTION' },
    },
    {
      message: 'Já existe instituição com este telefone/celular cadastrado',
    },
  )
  @ApiProperty({
    description:
      'Número de telefone ou celular da instituição médica (apenas números, deve ser único)',
    example: '1133334444',
    minLength: 10,
    maxLength: 15,
    type: String,
  })
  public phone: string;

  @IsString({
    message: provideIsStringValidationMessage('Código do País'),
  })
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Código do País'),
  })
  @Length(1, 3, { message: provideLengthValidationMessage })
  @ApiProperty({
    description:
      'Código do país da instituição médica (ISO 3166-1 alfa-2 ou alfa-3)',
    example: 'BRA',
    minLength: 1,
    maxLength: 3,
    type: String,
  })
  public countryCode: string;

  @IsString({
    message: provideIsStringValidationMessage('Código IDD do País'),
  })
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Código IDD do País'),
  })
  @Length(1, 5, { message: provideLengthValidationMessage })
  @ApiProperty({
    description:
      'Código de discagem direta internacional (IDD) do país da instituição médica',
    example: '+55',
    minLength: 1,
    maxLength: 5,
    type: String,
  })
  public countryIdd: string;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Termos Aceitos'),
  })
  @IsArray({ message: 'Termos aceitos deve ser um array' })
  @ContainsRequiredTerms(
    [TermsType.PRIVACY_POLICY, TermsType.TERMS_OF_SERVICE],
    {
      message:
        'Você deve aceitar os Termos de Uso e a Política de Privacidade para continuar',
    },
  )
  @ApiProperty({
    description:
      'Lista dos tipos de termos aceitos pelo paciente (obrigatórios: privacy_policy, terms_of_service)',
    type: [String],
    example: ['privacy_policy', 'terms_of_service'],
    items: {
      type: 'string',
      enum: ['privacy_policy', 'terms_of_service'],
    },
  })
  public acceptedTerms: string[];

  @IsOptional()
  @IsString({
    message: provideIsStringValidationMessage('CNES'),
  })
  @Length(7, 7, {
    message: 'CNES deve ter exatamente 7 caracteres',
  })
  @IsUnique('dv_institution', 'cnes', {
    message: 'Já existe instituição com este CNES cadastrado',
  })
  @ApiPropertyOptional({
    description:
      'Código Nacional de Estabelecimentos de Saúde (CNES) - 7 dígitos numéricos',
    example: '1234567',
    minLength: 7,
    maxLength: 7,
    type: String,
  })
  public cnes: string;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Tipo de Instituição Médica'),
  })
  @IsEnum(MedicalInstitutionType, {
    message: provideIsEnumValidationMessage(
      'Tipo de Instituição Médica',
      MedicalInstitutionType,
    ),
  })
  @ApiProperty({
    description: 'Tipo de instituição médica',
    example: 'HOSPITAL',
    enum: MedicalInstitutionType,
    enumName: 'MedicalInstitutionType',
    type: String,
  })
  public medicalInstitutionType: MedicalInstitutionType;

  @ValidateIf((o) => o.medicalInstitutionType === MedicalInstitutionType.OUTROS)
  @IsNotEmpty({
    message:
      'Especificação do tipo de instituição é obrigatória quando selecionado "Outro"',
  })
  @IsString({
    message: provideIsStringValidationMessage(
      'Outro Tipo de Instituição Médica',
    ),
  })
  @MaxLength(255, {
    message: provideMaxLengthValidationMessage(
      'Outro Tipo de Instituição Médica',
    ),
  })
  @ApiPropertyOptional({
    description:
      'Especificação do tipo de instituição quando selecionado "Outro"',
    example: 'Centro de Reabilitação Especializado',
    maxLength: 255,
    type: String,
  })
  public otherMedicalInstitutionType: string;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Endereço'),
  })
  @ValidateNested()
  @Type(() => AddressDto)
  @ApiProperty({
    description: 'Endereço completo da instituição médica',
    type: () => AddressDto,
  })
  public address: AddressDto;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Representante Legal'),
  })
  @ValidateNested()
  @Type(() => CreateInstitutionCompanyRepresentativeDto)
  @ApiProperty({
    description: 'Dados do representante legal/técnico da instituição médica',
    type: () => CreateInstitutionCompanyRepresentativeDto,
  })
  public representative: CreateInstitutionCompanyRepresentativeDto;
}
