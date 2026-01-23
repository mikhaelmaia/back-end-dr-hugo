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
import { UserRole } from 'src/core/vo/consts/enums';
import { ExistsIn } from 'src/core/vo/validators/exists-in.validator';
import { IsNotEmptyString } from 'src/core/vo/validators/is-not-empty-string.validator';
import { IsUnique } from 'src/core/vo/validators/is-unique.validator';
import { IsValidTaxId } from 'src/core/vo/validators/is-valid-tax-id.validator';
import { User } from 'src/modules/users/entities/user.entity';

export class PatientDto extends BaseEntityDto<Patient> {
  public userId: string;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Nome do Usuário'),
  })
  @IsString({ message: provideIsStringValidationMessage('Nome do Usuário') })
  @IsNotEmptyString({
    message: provideIsNotEmptyStringValidationMessage('Nome do Usuário'),
  })
  @IsOnlyLetters({
    message: 'Nome do usuário deve conter apenas letras, espaços e caracteres básicos de pontuação',
  })
  @IsNotBlacklisted()
  @MaxLength(100, { message: provideMaxLengthValidationMessage })
  @Expose()
  @ApiProperty({ description: 'Nome do usuário', maxLength: 100 })
  public name: string;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('E-mail do Usuário'),
  })
  @IsString({ message: provideIsStringValidationMessage('E-mail do Usuário') })
  @IsEmail(
    {},
    { message: provideIsEmailValidationMessage('E-mail do Usuário') },
  )
  @IsNotBlacklisted()
  @MaxLength(50, { message: provideMaxLengthValidationMessage })
  @IsUnique('dv_user', 'email', {
    message: 'Já existe usuário com este e-mail cadastrado',
  })
  @ApiProperty({ description: 'E-mail do usuário', maxLength: 50 })
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
  @ApiProperty({ description: 'Senha do usuário' })
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
    description: 'CPF/CNPJ do usuário',
    minLength: 11,
    maxLength: 14,
  })
  public taxId: string;

  @IsString({
    message: provideIsStringValidationMessage('Telefone/Celular do Usuário'),
  })
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Telefone/Celular do Usuário'),
  })
  @Length(10, 15, { message: provideLengthValidationMessage })
  @IsUnique('dv_user', 'phone', {
    message: 'Já existe usuário com este telefone/celular cadastrado',
  })
  @ApiProperty({
    description: 'Telefone/Celular do usuário',
    minLength: 10,
    maxLength: 15,
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
    description: 'Código do país',
    minLength: 1,
    maxLength: 3,
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
    description: 'Código IDD do país',
    minLength: 1,
    maxLength: 5,
  })
  public countryIdd: string;

  @ApiProperty({
    description: 'Perfil de acesso do usuário',
    required: false,
    minLength: 10,
    maxLength: 15,
    enum: UserRole,
  })
  public role: UserRole;

  @Expose()
  @IsOptional()
  @ExistsIn('dv_media', 'id', { message: 'Arquivo de mídia não encontrado' })
  public profilePictureId: string;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Data de Nascimento'),
  })
  @IsDate({ message: 'Data de nascimento deve ser uma data válida' })
  @Type(() => Date)
  @ApiProperty({ description: 'Data de nascimento do paciente', type: 'string', format: 'date' })
  public birthDate: Date;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Termos Aceitos'),
  })
  @IsArray({ message: 'Termos aceitos deve ser um array' })
  @ContainsRequiredTerms(['privacy_policy', 'terms_of_service'], {
    message: 'Os termos obrigatórios devem ser aceitos: política de privacidade e termos de serviço',
  })
  @ApiProperty({
    description: 'Lista de termos aceitos pelo paciente',
    type: [String],
    example: ['privacy_policy', 'terms_of_service'],
  })
  public acceptedTerms: string[];
}
