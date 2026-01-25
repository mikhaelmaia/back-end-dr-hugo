import {
  provideIsValidTaxIdValidationMessage,
  provideMinLengthValidationMessage,
} from './../../../core/vo/consts/validation-messages';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { BaseEntityDto } from '../../../core/base/base.entity.dto';
import { UserRole } from '../../../core/vo/consts/enums';
import { User } from '../entities/user.entity';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotBlacklisted } from '../../../core/vo/validators/is-not-blacklisted.validator';
import {
  provideIsEmailValidationMessage,
  provideIsNotEmptyStringValidationMessage,
  provideIsNotEmptyValidationMessage,
  provideIsStringValidationMessage,
  provideLengthValidationMessage,
  provideMaxLengthValidationMessage,
} from '../../../core/vo/consts/validation-messages';
import { ExistsIn } from '../../../core/vo/validators/exists-in.validator';
import { IsNotEmptyString } from '../../../core/vo/validators/is-not-empty-string.validator';
import { IsValidTaxId } from '../../../core/vo/validators/is-valid-tax-id.validator';
import { IsUnique } from 'src/core/vo/validators/is-unique.validator';
import { ContainsRequiredTerms } from 'src/core/vo/validators/contains-required-terms.validator';

export class UserDto extends BaseEntityDto<User> {
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Nome do Usuário'),
  })
  @IsString({ message: provideIsStringValidationMessage('Nome do Usuário') })
  @IsNotEmptyString({
    message: provideIsNotEmptyStringValidationMessage('Nome do Usuário'),
  })
  @IsNotBlacklisted()
  @MaxLength(100, { message: provideMaxLengthValidationMessage })
  @Expose()
  @ApiProperty({ 
    description: 'Nome completo do usuário',
    example: 'Dr. João Silva',
    maxLength: 100,
    type: String
  })
  public name: string;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('E-mail do Usuário'),
  })
  @IsString({ message: provideIsStringValidationMessage('E-mail do Usuário') })
  @IsEmail(
    {},
    { message: provideIsEmailValidationMessage() },
  )
  @IsNotBlacklisted()
  @MaxLength(50, { message: provideMaxLengthValidationMessage })
  @IsUnique('dv_user', 'email', {
    message: 'Já existe usuário com este e-mail cadastrado',
  })
  @ApiProperty({ 
    description: 'Endereço de e-mail do usuário (deve ser único)',
    example: 'joao.silva@email.com',
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
  @MinLength(6, {
    message: provideMinLengthValidationMessage('Senha do Usuário', 6),
  })
  @Exclude({ toPlainOnly: true })
  @ApiProperty({ 
    description: 'Senha do usuário (mínimo 6 caracteres)',
    example: 'senhaSegura123',
    minLength: 6,
    type: String,
    writeOnly: true
  })
  public password: string;

  @IsString({
    message: provideIsStringValidationMessage('CPF/CNPJ do Usuário'),
  })
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('CPF/CNPJ do Usuário'),
  })
  @Length(11, 14, { message: provideLengthValidationMessage })
  @IsNotEmptyString({
    message: provideIsNotEmptyStringValidationMessage('CPF/CNPJ do Usuário'),
  })
  @IsValidTaxId({
    message: provideIsValidTaxIdValidationMessage('CPF/CNPJ do Usuário'),
  })
  @IsUnique('dv_user', 'taxId', {
    message: 'Já existe usuário com este CPF/CNPJ cadastrado',
  })
  @ApiProperty({
    description: 'CPF ou CNPJ do usuário (apenas números, deve ser único)',
    example: '12345678901',
    minLength: 11,
    maxLength: 14,
    type: String
  })
  public taxId: string;

  @IsString({
    message: provideIsStringValidationMessage('Telefone/Celular do Usuário'),
  })
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Telefone/Celular do Usuário'),
  })
  @Length(10, 15, { message: provideLengthValidationMessage })
  @ApiProperty({
    description: 'Número de telefone ou celular do usuário (apenas números)',
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
    description: 'Código do país (ISO 3166-1 alfa-2 ou alfa-3)',
    example: 'BR',
    minLength: 1,
    maxLength: 3,
    type: String
  })
  public countryCode: string;

  @IsString({
    message: provideIsStringValidationMessage('Código DDI do País'),
  })
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Código DDI do País'),
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
    description: 'Perfil de acesso do usuário no sistema',
    example: 'DOCTOR',
    required: false,
    enum: UserRole,
    enumName: 'UserRole'
  })
  public role: UserRole;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Termos Aceitos'),
  })
  @IsArray({ message: 'Termos aceitos deve ser um array' })
  @ContainsRequiredTerms(['privacy_policy', 'terms_of_service'], {
    message: 'Os termos obrigatórios devem ser aceitos: política de privacidade e termos de serviço',
  })
  @ApiProperty({
    description: 'Lista dos tipos de termos aceitos pelo usuário (obrigatórios: privacy_policy, terms_of_service)',
    type: [String],
    example: ['privacy_policy', 'terms_of_service'],
    items: {
      type: 'string',
      enum: ['privacy_policy', 'terms_of_service']
    }
  })
  public acceptedTerms: string[];

  @ApiProperty({
    description: 'ID da mídia que contém a foto de perfil do usuário',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    required: false,
    type: String
  })
  @Expose()
  @IsOptional()
  @ExistsIn('dv_media', 'id', { message: 'Arquivo de mídia não encontrado' })
  public profilePictureId: string;

  @Exclude()
  public isActive: boolean;
}
