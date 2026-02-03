import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import {
  provideIsNotEmptyValidationMessage,
  provideIsStringValidationMessage,
  provideIsEnumValidationMessage,
} from 'src/core/vo/consts/validation-messages';
import { UserRole } from 'src/core/vo/consts/enums';

export class StartPasswordRecoveryDto {
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Login de acesso'),
  })
  @IsString({ message: provideIsStringValidationMessage('Login de acesso') })
  @ApiProperty({
    description: 'Login do usuário (pode ser email, CPF ou CNPJ)',
    example: 'joao.silva@email.com',
    maxLength: 50,
    type: String
  })
  public login: string;

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