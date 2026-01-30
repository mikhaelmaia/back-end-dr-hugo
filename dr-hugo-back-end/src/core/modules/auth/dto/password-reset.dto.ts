import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsEnum } from 'class-validator';
import {
  provideIsNotEmptyValidationMessage,
  provideIsStringValidationMessage,
  provideIsEmailValidationMessage,
  provideIsEnumValidationMessage,
} from 'src/core/vo/consts/validation-messages';
import { UserRole } from 'src/core/vo/consts/enums';

export class PasswordResetDto {
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Identificação do Token'),
  })
  @IsString({
    message: provideIsStringValidationMessage('Identificação do Token'),
  })
  @ApiProperty({
    description: 'Identificação única do token de recuperação enviado por email',
    example: 'abc123def456',
    minLength: 4,
    maxLength: 32,
    type: String
  })
  public tokenIdentification: string;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('E-mail do usuário'),
  })
  @IsEmail(
    {},
    { message: provideIsEmailValidationMessage() },
  )
  @ApiProperty({ 
    description: 'Endereço de email do usuário para confirmação',
    example: 'joao.silva@email.com',
    format: 'email',
    type: String
  })
  public email: string;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Nova senha do usuário'),
  })
  @IsString({
    message: provideIsStringValidationMessage('Nova senha do usuário'),
  })
  @ApiProperty({ 
    description: 'Nova senha que será definida para o usuário',
    example: 'novasenhasegura456',
    minLength: 6,
    type: String,
    writeOnly: true
  })
  public password: string;

  @IsNotEmpty({ message: provideIsNotEmptyValidationMessage('Perfil de Acesso') })
  @IsEnum(UserRole, { message: (args) => provideIsEnumValidationMessage(args, UserRole) })
  @ApiProperty({
    description: 'Perfil de acesso do usuário',
    example: 'PATIENT',
    enum: UserRole,
    enumName: 'UserRole'
  })
  public role: UserRole;
}
