import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsEnum } from 'class-validator';
import {
  provideIsEmailValidationMessage,
  provideIsNotEmptyValidationMessage,
  provideIsEnumValidationMessage,
} from 'src/core/vo/consts/validation-messages';
import { UserRole } from 'src/core/vo/consts/enums';

export class ResendEmailConfirmationDto {
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Email'),
  })
  @IsEmail({}, {
    message: provideIsEmailValidationMessage(),
  })
  @ApiProperty({
    description: 'Email do usuário para confirmação',
    example: 'usuario@email.com',
    type: String
  })
  public email: string;

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