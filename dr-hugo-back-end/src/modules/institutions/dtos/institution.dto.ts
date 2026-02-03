import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsArray,
  Length,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Expose, Exclude, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntityDto } from 'src/core/base/base.entity.dto';
import { MedicalInstitutionType, UserRole, TermsType } from 'src/core/vo/consts/enums';
import {
  provideIsNotEmptyValidationMessage,
  provideIsEmailValidationMessage,
  provideIsNotEmptyStringValidationMessage,
  provideIsStringValidationMessage,
  provideIsValidTaxIdValidationMessage,
  provideLengthValidationMessage,
  provideMaxLengthValidationMessage,
  provideIsEnumValidationMessage,
} from 'src/core/vo/consts/validation-messages';
import { IsNotBlacklisted } from 'src/core/vo/validators/is-not-blacklisted.validator';
import { IsOnlyLetters } from 'src/core/vo/validators/is-only-letters.validator';
import { IsStrongPassword } from 'src/core/vo/validators/is-strong-password.validator';
import { ContainsRequiredTerms } from 'src/core/vo/validators/contains-required-terms.validator';
import { ExistsIn } from 'src/core/vo/validators/exists-in.validator';
import { IsNotEmptyString } from 'src/core/vo/validators/is-not-empty-string.validator';
import { IsUnique } from 'src/core/vo/validators/is-unique.validator';
import { IsValidTaxId } from 'src/core/vo/validators/is-valid-tax-id.validator';
import { CompanyDto } from '../aggregates/company/dtos/company.dto';
import { Institution } from '../entities/institution.entity';
import { AddressDto } from 'src/core/modules/address/dtos/address.dto';

export class InstitutionDto extends BaseEntityDto<Institution> {
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Nome da Instituição'),
  })
  @IsString({ 
    message: provideIsStringValidationMessage('Nome da Instituição') 
  })
  @IsNotEmptyString({
    message: provideIsNotEmptyStringValidationMessage('Nome da Instituição'),
  })
  @IsOnlyLetters({
    message: 'Nome da instituição deve conter apenas letras, espaços e caracteres básicos de pontuação',
  })
  @IsNotBlacklisted()
  @MaxLength(100, { 
    message: provideMaxLengthValidationMessage('Nome da Instituição') 
  })
  @Expose()
  @ApiProperty({
    description: 'Nome completo da instituição médica',
    example: 'Hospital São João',
    maxLength: 100,
    type: String
  })
  public name: string;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('E-mail'),
  })
  @IsString({ 
    message: provideIsStringValidationMessage('E-mail') 
  })
  @IsEmail(
    {},
    { message: provideIsEmailValidationMessage() },
  )
  @IsNotBlacklisted()
  @MaxLength(50, { 
    message: provideMaxLengthValidationMessage('E-mail') 
  })
  @IsUnique('dv_user', 'email', {
    message: 'Já existe usuário com este e-mail cadastrado',
  })
  @ApiProperty({
    description: 'Endereço de e-mail da instituição (deve ser único no sistema)',
    example: 'contato@hospitalsaojoao.com.br',
    maxLength: 50,
    format: 'email',
    type: String
  })
  public email: string;

  @ValidateIf((o: Institution) => !o.id)
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Senha do Usuário'),
  })
  @IsString({ 
    message: provideIsStringValidationMessage('Senha do Usuário') 
  })
  @IsNotEmptyString({
    message: provideIsNotEmptyStringValidationMessage('Senha do Usuário'),
  })
  @IsStrongPassword()
  @Exclude({ toPlainOnly: true })
  @ApiProperty({
    description: 'Senha de acesso da instituição (deve ser forte: minúscula, maiúscula, número e caractere especial)',
    example: 'MinhaSenh@123',
    minLength: 8,
    type: String,
    writeOnly: true
  })
  public password: string;

  @IsString({
    message: provideIsStringValidationMessage('CNPJ'),
  })
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('CNPJ'),
  })
  @Length(11, 14, { 
    message: provideLengthValidationMessage('CNPJ') 
  })
  @IsNotEmptyString({
    message: provideIsNotEmptyStringValidationMessage('CNPJ'),
  })
  @IsValidTaxId({
    message: provideIsValidTaxIdValidationMessage('CNPJ'),
  })
  @IsUnique('dv_user', 'taxId', {
    message: 'Já existe usuário com este CNPJ cadastrado',
  })
  @ApiProperty({
    description: 'CNPJ da instituição (apenas números, deve ser único)',
    example: '12345678000123',
    minLength: 14,
    maxLength: 14,
    type: String
  })
  public taxId: string;

  @IsString({
    message: provideIsStringValidationMessage('Telefone'),
  })
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Telefone'),
  })
  @Length(10, 15, { 
    message: provideLengthValidationMessage('Telefone') 
  })
  @IsUnique('dv_user', 'phone', {
    message: 'Já existe usuário com este telefone cadastrado',
  })
  @ApiProperty({
    description: 'Número de telefone da instituição (apenas números, deve ser único)',
    example: '1133334444',
    minLength: 10,
    maxLength: 15,
    type: String
  })
  public phone: string;

  @IsString({
    message: provideIsStringValidationMessage('Código do País'),
  })
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Código do País'),
  })
  @Length(1, 3, { 
    message: provideLengthValidationMessage('Código do País') 
  })
  @ApiProperty({
    description: 'Código do país da instituição (ISO 3166-1 alfa-2 ou alfa-3)',
    example: 'BRA',
    minLength: 1,
    maxLength: 3,
    type: String
  })
  public countryCode: string;

  @IsString({
    message: provideIsStringValidationMessage('Código IDD do País'),
  })
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Código IDD do País'),
  })
  @Length(1, 5, { 
    message: provideLengthValidationMessage('Código IDD do País') 
  })
  @ApiProperty({
    description: 'Código de discagem direta internacional (IDD) do país',
    example: '+55',
    minLength: 1,
    maxLength: 5,
    type: String
  })
  public countryIdd: string;

  @ApiProperty({
    description: 'Perfil de acesso da instituição no sistema (sempre INSTITUTION)',
    example: 'INSTITUTION',
    enum: UserRole,
    enumName: 'UserRole',
    required: false
  })
  public role: UserRole;

  @ApiProperty({
    description: 'ID da mídia que contém a foto de perfil da instituição',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    required: false,
    type: String
  })
  @Expose()
  @IsOptional()
  @ExistsIn('dv_media', 'id', { 
    message: 'Arquivo de mídia não encontrado' 
  })
  public profilePictureId: string;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Termos Aceitos'),
  })
  @IsArray({ 
    message: 'Termos aceitos deve ser um array' 
  })
  @ContainsRequiredTerms([TermsType.PRIVACY_POLICY, TermsType.TERMS_OF_SERVICE], {
    message: 'Você deve aceitar os Termos de Uso e a Política de Privacidade para continuar',
  })
  @ApiProperty({
    description: 'Lista dos tipos de termos aceitos pela instituição (obrigatórios: privacy_policy, terms_of_service)',
    type: [String],
    example: ['privacy_policy', 'terms_of_service'],
    items: {
      type: 'string',
      enum: ['privacy_policy', 'terms_of_service']
    }
  })
  public acceptedTerms: string[];

  @IsOptional()
  @IsString({
    message: provideIsStringValidationMessage('CNES'),
  })
  @Length(7, 7, { 
    message: 'CNES deve ter exatamente 7 caracteres' 
  })
  @IsUnique('dv_institution', 'cnes', {
    message: 'Já existe instituição com este CNES cadastrado',
  })
  @ApiPropertyOptional({
    description: 'Código Nacional de Estabelecimentos de Saúde (CNES) - 7 dígitos',
    example: '1234567',
    minLength: 7,
    maxLength: 7,
    type: String
  })
  public cnes?: string;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Tipo de Instituição Médica'),
  })
  @IsEnum(MedicalInstitutionType, {
    message: provideIsEnumValidationMessage('Tipo de Instituição Médica', MedicalInstitutionType),
  })
  @ApiProperty({
    description: 'Tipo de instituição médica',
    example: 'HOSPITAL',
    enum: MedicalInstitutionType,
    enumName: 'MedicalInstitutionType',
    type: String
  })
  public medicalInstitutionType: MedicalInstitutionType;

  @ValidateNested()
  @Type(() => AddressDto)
  @ApiProperty({
    description: 'Endereço da instituição',
    type: () => AddressDto
  })
  public address: AddressDto;

  @ValidateNested()
  @Type(() => CompanyDto)
  @ApiProperty({
    description: 'Dados da empresa vinculada à instituição',
    type: () => CompanyDto
  })
  public company: CompanyDto;
}
