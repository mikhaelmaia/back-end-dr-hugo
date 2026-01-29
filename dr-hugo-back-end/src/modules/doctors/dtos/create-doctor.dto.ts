import {
  IsString,
  IsNotEmpty,
  Length,
  MaxLength,
  IsEmail,
  IsStrongPassword,
} from 'class-validator';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  provideIsStringValidationMessage,
  provideIsNotEmptyValidationMessage,
  provideIsNotEmptyStringValidationMessage,
  provideLengthValidationMessage,
  provideMaxLengthValidationMessage,
  provideIsEmailValidationMessage,
  provideIsValidTaxIdValidationMessage,
} from 'src/core/vo/consts/validation-messages';
import { IsNotBlacklisted } from 'src/core/vo/validators/is-not-blacklisted.validator';
import { IsNotEmptyString } from 'src/core/vo/validators/is-not-empty-string.validator';
import { IsUnique } from 'src/core/vo/validators/is-unique.validator';
import { IsValidTaxId } from 'src/core/vo/validators/is-valid-tax-id.validator';

export class CreateDoctorDto {
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
    description: 'Endereço de e-mail do médico (deve ser único no sistema)',
    example: 'maria.silva@email.com',
    maxLength: 50,
    format: 'email',
    type: String
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
    description: 'Senha de acesso do médico (deve ser forte: minúscula, maiúscula, número e caractere especial)',
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
    description: 'CPF do médico (apenas números, deve ser único)',
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
    description: 'Número de telefone ou celular do médico (apenas números, deve ser único)',
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
    description: 'Código do país do médico (ISO 3166-1 alfa-2 ou alfa-3)',
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
    description: 'Código de discagem direta internacional (IDD) do país do médico',
    example: '+55',
    minLength: 1,
    maxLength: 5,
    type: String
  })
  public countryIdd: string;

}