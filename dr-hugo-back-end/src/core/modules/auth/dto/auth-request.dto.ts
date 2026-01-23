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
    description: 'Login do usuário (pode ser email, CPF ou CNPJ)',
    example: 'joao.silva@email.com',
    maxLength: 50,
    type: String
  })
  public login: string;

  @IsNotEmpty({ message: provideIsNotEmptyValidationMessage('Senha') })
  @IsString({ message: provideIsStringValidationMessage('Senha') })
  @ApiProperty({ 
    description: 'Senha de acesso do usuário',
    example: 'minhasenhasegura123',
    type: String,
    writeOnly: true
  })
  public password: string;
}
