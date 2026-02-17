import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  Length,
  ValidateIf,
} from 'class-validator';
import {
  provideIsStringValidationMessage,
  provideIsNotEmptyValidationMessage,
  provideIsEmailValidationMessage,
  provideMinLengthValidationMessage,
  provideMaxLengthValidationMessage,
  provideLengthValidationMessage,
} from 'src/core/vo/consts/validation-messages';
import { IsNotEmptyString } from 'src/core/vo/validators/is-not-empty-string.validator';

/**
 * DTO para solicitação de alteração de dados do usuário
 * Permite alterar e-mail e/ou telefone mediante confirmação de senha atual
 */
export class RequestUserChangeDto {
  @ApiProperty({
    description:
      'Novo endereço de e-mail do usuário (opcional se informado telefone)',
    example: 'novo.email@exemplo.com',
    type: String,
    format: 'email',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString({ message: provideIsStringValidationMessage('Novo E-mail') })
  @IsEmail({}, { message: provideIsEmailValidationMessage() })
  @MaxLength(255, {
    message: provideMaxLengthValidationMessage('Novo E-mail', 255),
  })
  public newEmail?: string;

  @ApiProperty({
    description:
      'Novo número de telefone do usuário (opcional se informado e-mail)',
    example: '11987654321',
    type: String,
    minLength: 10,
    maxLength: 15,
    required: false,
  })
  @IsOptional()
  @IsString({ message: provideIsStringValidationMessage('Novo Telefone') })
  @Length(10, 15, { message: provideLengthValidationMessage('Novo Telefone') })
  public newPhone?: string;

  @ApiProperty({
    description:
      'Novo código do país (obrigatório se informado novo telefone)',
    example: 'BR',
    type: String,
    minLength: 1,
    maxLength: 3,
    required: false,
  })
  @ValidateIf((o) => !!o.newPhone)
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Novo Código do País'),
  })
  @IsString({ message: provideIsStringValidationMessage('Novo Código do País') })
  @Length(1, 3, { message: provideLengthValidationMessage('Novo Código do País') })
  public newCountryCode?: string;

  @ApiProperty({
    description:
      'Novo código DDI do país (obrigatório se informado novo telefone)',
    example: '+55',
    type: String,
    minLength: 1,
    maxLength: 5,
    required: false,
  })
  @ValidateIf((o) => !!o.newPhone)
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Novo Código DDI do País'),
  })
  @IsString({ message: provideIsStringValidationMessage('Novo Código DDI do País') })
  @Length(1, 5, { message: provideLengthValidationMessage('Novo Código DDI do País') })
  public newCountryIdd?: string;

  @ApiProperty({
    description: 'Senha atual do usuário para confirmação da alteração',
    example: 'MinhaSenh@Atual123',
    type: String,
    minLength: 6,
    writeOnly: true,
  })
  @IsString({ message: provideIsStringValidationMessage('Senha Atual') })
  @IsNotEmpty({ message: provideIsNotEmptyValidationMessage('Senha Atual') })
  @IsNotEmptyString({ message: 'Senha atual não pode ser uma string vazia' })
  @MinLength(6, {
    message: provideMinLengthValidationMessage('Senha Atual', 6),
  })
  public currentPassword: string;
}
