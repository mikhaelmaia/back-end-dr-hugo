import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, Length, Matches } from 'class-validator';
import {
  provideIsStringValidationMessage,
  provideIsNotEmptyValidationMessage,
} from 'src/core/vo/consts/validation-messages';
import { IsNotEmptyString } from 'src/core/vo/validators/is-not-empty-string.validator';

/**
 * DTO para confirmação de solicitação de alteração de dados do usuário
 * Usado para confirmar alterações pendentes através de token validado
 */
export class ConfirmUserChangeRequestDto {
  @ApiProperty({
    description: 'ID da solicitação de alteração a ser confirmada',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
    format: 'uuid',
  })
  @IsString({ message: provideIsStringValidationMessage('ID da Solicitação') })
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('ID da Solicitação'),
  })
  @IsUUID(4, { message: 'ID da solicitação deve ser um UUID válido' })
  public id: string;

  @ApiProperty({
    description: 'Hash de validação obtido após validação do token',
    example: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567890abcdef12',
    type: String,
    minLength: 64,
    maxLength: 64,
    pattern: '^[a-f0-9]{64}$',
  })
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Identificação do Token'),
  })
  @IsString({
    message: provideIsStringValidationMessage('Identificação do Token'),
  })
  public hash: string;
}
