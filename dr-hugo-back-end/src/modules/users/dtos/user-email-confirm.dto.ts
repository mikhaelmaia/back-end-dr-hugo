import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import {
  provideIsNotEmptyValidationMessage,
} from 'src/core/vo/consts/validation-messages';
import { ResendUserEmailConfirmationDto } from './resend-user-email-confirmation.dto';

export class UserEmailConfirmDto extends ResendUserEmailConfirmationDto {
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('ID do código'),
  })
  @ApiProperty({
    description: 'ID do código para confirmação do email',
    example: 'abc123def456ghi789',
    type: String
  })
  public tokenIdentification: string;
}