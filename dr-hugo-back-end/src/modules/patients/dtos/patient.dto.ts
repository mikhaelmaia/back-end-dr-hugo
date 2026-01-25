import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  Length,
  MaxLength,
  ValidateIf,
  IsArray,
  IsDate,
} from 'class-validator';
import { Expose, Exclude, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityDto } from 'src/core/base/base.entity.dto';
import { Patient } from '../entities/patient.entity';
import {
  provideIsNotEmptyValidationMessage,
  provideIsEmailValidationMessage,
  provideIsNotEmptyStringValidationMessage,
  provideIsStringValidationMessage,
  provideIsValidTaxIdValidationMessage,
  provideLengthValidationMessage,
  provideMaxLengthValidationMessage,
} from 'src/core/vo/consts/validation-messages';
import { IsNotBlacklisted } from 'src/core/vo/validators/is-not-blacklisted.validator';
import { IsOnlyLetters } from 'src/core/vo/validators/is-only-letters.validator';
import { IsStrongPassword } from 'src/core/vo/validators/is-strong-password.validator';
import { ContainsRequiredTerms } from 'src/core/vo/validators/contains-required-terms.validator';
import { TermsType, UserRole } from 'src/core/vo/consts/enums';
import { ExistsIn } from 'src/core/vo/validators/exists-in.validator';
import { IsNotEmptyString } from 'src/core/vo/validators/is-not-empty-string.validator';
import { IsUnique } from 'src/core/vo/validators/is-unique.validator';
import { IsValidTaxId } from 'src/core/vo/validators/is-valid-tax-id.validator';
import { User } from 'src/modules/users/entities/user.entity';

export class PatientDto extends BaseEntityDto<Patient> {
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Nome Completo'),
  })
  @IsString({ message: provideIsStringValidationMessage('Nome Completo') })
  @IsNotEmptyString({
    message: provideIsNotEmptyStringValidationMessage('Nome Completo'),
  })
  @IsOnlyLetters({
    message: 'Nome Completo deve conter apenas letras, espaços e caracteres básicos de pontuação',
  })
  @IsNotBlacklisted()
  @MaxLength(100, { message: provideMaxLengthValidationMessage('Nome Completo') })
  @Expose()
  @ApiProperty({ 
    description: 'Nome completo do paciente (apenas letras, espaços e pontuação básica)',
    example: 'Maria Silva Santos',
    maxLength: 100,
    type: String
  })
  public name: string;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('E-mail'),
  })
  @IsString({ message: provideIsStringValidationMessage('E-mail') })
  @IsEmail(
    {},
    { message: provideIsEmailValidationMessage() },
  )
  @IsNotBlacklisted()
  @MaxLength(50, { message: provideMaxLengthValidationMessage('E-mail') })
  @IsUnique('dv_user', 'email', {
    message: 'Já existe usuário com este e-mail cadastrado',
  })
  @ApiProperty({ 
    description: 'Endereço de e-mail do paciente (deve ser único no sistema)',
    example: 'maria.silva@email.com',
    maxLength: 50,
    format: 'email',
    type: String
  })
  public email: string;

  @ValidateIf((o: User) => !o.id)
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
    description: 'Senha de acesso do paciente (deve ser forte: minúscula, maiúscula, número e caractere especial)',
    example: 'MinhaSenh@123',
    minLength: 8,
    type: String,
    writeOnly: true
  })
  public password: string;

  @IsString({
    message: provideIsStringValidationMessage('CPF'),
  })
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('CPF'),
  })
  @Length(11, 14, { message: provideLengthValidationMessage('CPF') })
  @IsNotEmptyString({
    message: provideIsNotEmptyStringValidationMessage('CPF'),
  })
  @IsValidTaxId({
    message: provideIsValidTaxIdValidationMessage('CPF'),
  })
  @IsUnique('dv_user', 'taxId', {
    message: 'Já existe usuário com este CPF cadastrado',
  })
  @ApiProperty({
    description: 'CPF do paciente (apenas números, deve ser único)',
    example: '12345678901',
    minLength: 11,
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
  @Length(10, 15, { message: provideLengthValidationMessage('Telefone') })
  @IsUnique('dv_user', 'phone', {
    message: 'Já existe usuário com este telefone/celular cadastrado',
  })
  @ApiProperty({
    description: 'Número de telefone ou celular do paciente (apenas números, deve ser único)',
    example: '11987654321',
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
  @Length(1, 3, { message: provideLengthValidationMessage })
  @ApiProperty({
    description: 'Código do país do paciente (ISO 3166-1 alfa-2 ou alfa-3)',
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
  @Length(1, 5, { message: provideLengthValidationMessage })
  @ApiProperty({
    description: 'Código de discagem direta internacional (IDD) do país',
    example: '+55',
    minLength: 1,
    maxLength: 5,
    type: String
  })
  public countryIdd: string;

  @ApiProperty({
    description: 'Perfil de acesso do paciente no sistema (sempre PATIENT para pacientes)',
    example: 'PATIENT',
    enum: UserRole,
    enumName: 'UserRole',
    required: false
  })
  public role: UserRole;

  @ApiProperty({
    description: 'ID da mídia que contém a foto de perfil do paciente',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    required: false,
    type: String
  })
  @Expose()
  @IsOptional()
  @ExistsIn('dv_media', 'id', { message: 'Arquivo de mídia não encontrado' })
  public profilePictureId: string;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Data de Nascimento'),
  })
  @IsDate({ message: 'Data de nascimento deve estar no formato DD/MM/AAAA' })
  @Type(() => Date)
  @ApiProperty({ 
    description: 'Data de nascimento do paciente',
    example: '1990-05-15',
    type: String, 
    format: 'date'
  })
  public birthDate: Date;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Termos Aceitos'),
  })
  @IsArray({ message: 'Termos aceitos deve ser um array' })
  @ContainsRequiredTerms([TermsType.PRIVACY_POLICY, TermsType.TERMS_OF_SERVICE], {
    message: 'Você deve aceitar os Termos de Uso e a Política de Privacidade para continuar',
  })
  @ApiProperty({
    description: 'Lista dos tipos de termos aceitos pelo paciente (obrigatórios: privacy_policy, terms_of_service)',
    type: [String],
    example: ['privacy_policy', 'terms_of_service'],
    items: {
      type: 'string',
      enum: ['privacy_policy', 'terms_of_service']
    }
  })
  public acceptedTerms: string[];
}
