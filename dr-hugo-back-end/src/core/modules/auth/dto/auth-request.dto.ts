import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import {
  provideIsNotEmptyValidationMessage,
  provideIsStringValidationMessage,
} from 'src/core/vo/consts/validation-messages';

export class AuthRequest {
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Login de acesso'),
  })
  @IsString({ message: provideIsStringValidationMessage('Login de acesso') })
  @ApiProperty({
    description: 'Login do usuário',
    required: true,
    maxLength: 50,
  })
  public login: string;

  @IsNotEmpty({ message: provideIsNotEmptyValidationMessage('Senha') })
  @IsString({ message: provideIsStringValidationMessage('Senha') })
  @ApiProperty({ description: 'Senha do usuário', required: true })
  public password: string;
}
