import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';
import {
  provideIsStringValidationMessage,
  provideIsNotEmptyValidationMessage,
} from 'src/core/vo/consts/validation-messages';

/**
 * DTO para confirmação de solicitação de alteração de dados do usuário
 * O parâmetro t é a chave de resolução enviada por e-mail no link de confirmação.
 */
export class ConfirmUserChangeRequestDto {
  @IsString({
    message: provideIsStringValidationMessage('Chave de confirmação'),
  })
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Chave de confirmação'),
  })
  @Length(64, 64, {
    message: 'Chave de confirmação deve ter exatamente 64 caracteres',
  })
  @ApiProperty({
    description:
      'Chave de resolução enviada por e-mail (parâmetro t do link de confirmação)',
    example: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    minLength: 64,
    maxLength: 64,
    type: String,
  })
  public t: string;
}
