import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  Length,
} from 'class-validator';
import {
  provideIsNotEmptyValidationMessage,
  provideIsStringValidationMessage,
  provideIsEmailValidationMessage,
  provideIsEnumValidationMessage,
} from 'src/core/vo/consts/validation-messages';
import { UserRole } from 'src/core/vo/consts/enums';

export class PasswordResetDto {
  @IsOptional()
  @IsString({ message: provideIsStringValidationMessage('Chave de resolução') })
  @Length(64, 64, {
    message: 'Chave de resolução deve ter exatamente 64 caracteres',
  })
  @ApiProperty({
    description:
      'Chave de resolução enviada por e-mail (parâmetro t do link). Use este campo OU os campos tokenIdentification + email + role.',
    example: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    minLength: 64,
    maxLength: 64,
    required: false,
    type: String,
  })
  public t?: string;

  @IsOptional()
  @IsString({
    message: provideIsStringValidationMessage('Identificação do Token'),
  })
  @ApiProperty({
    description:
      'Hash do token obtido após validação manual do código de 6 dígitos. Use este campo (junto com email e role) quando o usuário digitar o código manualmente.',
    example: 'abc123def456',
    required: false,
    type: String,
  })
  public tokenIdentification?: string;

  @IsOptional()
  @IsEmail({}, { message: provideIsEmailValidationMessage() })
  @ApiProperty({
    description:
      'E-mail do usuário (obrigatório no fluxo manual, dispensável com t).',
    example: 'joao.silva@email.com',
    format: 'email',
    required: false,
    type: String,
  })
  public email?: string;

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
    writeOnly: true,
  })
  public password: string;

  @IsOptional()
  @IsEnum(UserRole, {
    message: (args) => provideIsEnumValidationMessage(args, UserRole),
  })
  @ApiProperty({
    description:
      'Perfil de acesso do usuário (obrigatório no fluxo manual, dispensável com t).',
    required: false,
    example: 'PATIENT',
    enum: UserRole,
    enumName: 'UserRole',
  })
  public role?: UserRole;
}
