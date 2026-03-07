import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import {
  provideIsNotEmptyValidationMessage,
  provideIsStringValidationMessage,
} from 'src/core/vo/consts/validation-messages';
import { IsUnique } from 'src/core/vo/validators/is-unique.validator';

export class RenamePatientDocumentDto {
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Descrição'),
  })
  @IsString({
    message: provideIsStringValidationMessage('Descrição'),
  })
  @IsUnique('dv_patient_document', 'description', {
    message: 'Já existe um documento com esta descrição.',
  })
  @ApiProperty({
    description: 'Descrição do documento médico (deve ser única no sistema)',
    example: 'Hemograma completo - exame de rotina',
  })
  public description: string;
}
