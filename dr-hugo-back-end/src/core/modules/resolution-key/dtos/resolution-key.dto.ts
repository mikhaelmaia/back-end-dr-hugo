import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  provideIsStringValidationMessage,
  provideIsNotEmptyValidationMessage,
} from 'src/core/vo/consts/validation-messages';
import { IsNotEmptyString } from 'src/core/vo/validators/is-not-empty-string.validator';

export class ResolutionKeyDto {
  @IsString({
    message: provideIsStringValidationMessage('Chave'),
  })
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Chave'),
  })
  @IsNotEmptyString({
    message: 'Chave não pode ser vazia',
  })
  @Length(64, 64, {
    message: 'Chave deve ter exatamente 64 caracteres',
  })
  @ApiProperty({
    description:
      'Chave de resolução gerada anteriormente (64 caracteres hexadecimais)',
    example: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    minLength: 64,
    maxLength: 64,
    type: String,
  })
  public key: string;
}

export class ResolutionKeyResolvedDto {
  @ApiProperty({
    description: 'Dados recuperados e associados à chave resolvida',
    example: { userId: '123', action: 'password-reset' },
  })
  public data: unknown;
}
