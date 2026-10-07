import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import {
  provideIsNotEmptyValidationMessage,
  provideIsStringValidationMessage,
} from 'src/core/vo/consts/validation-messages';
export class RenamePatientDocumentDto {
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Descrição'),
  })
  @IsString({
    message: provideIsStringValidationMessage('Descrição'),
  })
  @ApiProperty({
    description: 'Descrição do documento médico',
    example: 'Hemograma completo - exame de rotina',
  })
  public description: string;
}
