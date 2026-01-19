import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { provideIsNotEmptyValidationMessage, provideIsStringValidationMessage, provideIsEmailValidationMessage } from 'src/core/vo/consts/validation-messages';

export class AuthRequest {
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('E-mail de acesso'),
  })
  @IsString({ message: provideIsStringValidationMessage('E-mail de acesso') })
  @IsEmail({}, { message: provideIsEmailValidationMessage('E-mail de acesso') })
  @ApiProperty({
    description: 'E-mail do usuário',
    required: true,
    maxLength: 50,
  })
  public email: string;

  @IsNotEmpty({ message: provideIsNotEmptyValidationMessage('Senha') })
  @IsString({ message: provideIsStringValidationMessage('Senha') })
  @ApiProperty({ description: 'Senha do usuário', required: true })
  public password: string;
}
