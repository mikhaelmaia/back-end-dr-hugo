import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import {
  provideIsEmailValidationMessage,
  provideIsNotEmptyValidationMessage,
} from 'src/core/vo/consts/validation-messages';

export class ResendUserEmailConfirmationDto {
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Email'),
  })
  @IsEmail({}, {
    message: provideIsEmailValidationMessage('Email'),
  })
  @ApiProperty({
    description: 'Email do usuário para confirmação',
    example: 'usuario@email.com',
    type: String
  })
  public email: string;
}