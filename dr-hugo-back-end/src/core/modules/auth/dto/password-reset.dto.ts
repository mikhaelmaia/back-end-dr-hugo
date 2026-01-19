import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { provideIsNotEmptyValidationMessage, provideIsStringValidationMessage, provideIsEmailValidationMessage } from 'src/core/vo/consts/validation-messages';

export class PasswordResetDto {
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Identificação do Token'),
  })
  @IsString({
    message: provideIsStringValidationMessage('Identificação do Token'),
  })
  @ApiProperty({
    description: 'Identificação do Token',
    required: false,
    minLength: 4,
    maxLength: 32,
  })
  public tokenIdentification: string;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('E-mail do usuário'),
  })
  @IsEmail(
    {},
    { message: provideIsEmailValidationMessage('E-mail do usuário') },
  )
  @ApiProperty({ description: 'E-mail do usuário', required: false })
  public email: string;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Nova senha do usuário'),
  })
  @IsString({
    message: provideIsStringValidationMessage('Nova senha do usuário'),
  })
  @ApiProperty({ description: 'Nova senha do usuário', required: false })
  public password: string;
}
