import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  provideIsNotEmptyValidationMessage,
  provideIsStringValidationMessage,
} from 'src/core/vo/consts/validation-messages';
import { IsUnique } from 'src/core/vo/validators/is-unique.validator';

export class CnesValidationDto {
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('CNES'),
  })
  @IsString({
    message: provideIsStringValidationMessage('CNES'),
  })
  @Length(7, 7, {
    message: 'CNES deve ter exatamente 7 caracteres',
  })
  @IsUnique('dv_institution', 'cnes', {
    message: 'Já existe instituição com este CNES cadastrado',
  })
  @ApiProperty({
    description:
      'Código Nacional de Estabelecimentos de Saúde (CNES) para validação',
    example: '9577254',
    minLength: 7,
    maxLength: 7,
    type: String,
  })
  public cnes: string;
}
