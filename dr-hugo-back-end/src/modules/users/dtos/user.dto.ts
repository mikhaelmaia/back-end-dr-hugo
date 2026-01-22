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
  @IsUnique('dh_user', 'email', {
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
  @MinLength(6, {
    message: provideMinLengthValidationMessage('Senha do Usuário', 6),
  })
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
  @IsUnique('dh_user', 'taxId', {
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
  @ApiProperty({
    description: 'Telefone/Celular do usuário',
    minLength: 10,
    maxLength: 15,
  })
  public phone: string;

  @ApiProperty({
    description: 'Perfil de acesso do usuário',
    required: false,
    minLength: 10,
    maxLength: 15,
    enum: UserRole,
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
    description: 'Lista de termos aceitos pelo paciente',
    type: [String],
    example: ['privacy_policy', 'terms_of_service'],
  })
  public acceptedTerms: string[];

  @Expose()
  @IsOptional()
  @ExistsIn('dh_media', 'id', { message: 'Arquivo de mídia não encontrado' })
  public profilePictureId: string;
}
