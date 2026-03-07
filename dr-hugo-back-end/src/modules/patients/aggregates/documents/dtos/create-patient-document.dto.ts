import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsDate,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PatientDocumentType } from 'src/core/vo/consts/enums';
import { IsUnique } from 'src/core/vo/validators/is-unique.validator';
import {
  provideIsNotEmptyValidationMessage,
  provideIsStringValidationMessage,
  provideIsUUIDValidationMessage,
} from 'src/core/vo/consts/validation-messages';
import { ToLocalDate } from 'src/core/vo/transformers/to-local-date.transformer';
import { IsNotFutureDate } from 'src/core/vo/validators/is-not-future-date.validator';
import { IsEnumKey } from 'src/core/vo/validators/is-enum-key.validator';
import { Transform } from 'class-transformer';
import { findEnumValueByKeyOrValue } from 'src/core/utils/enum.utils';

export class CreatePatientDocumentDto {
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Tipo de Documento'),
  })
  @IsEnumKey(PatientDocumentType, {
    message: `Tipo de Documento deve ser um dos seguintes valores: ${Object.keys(PatientDocumentType).join(', ')}`,
  })
  @Transform(({ value }) =>
    findEnumValueByKeyOrValue(PatientDocumentType, value),
  )
  @ApiProperty({
    description: 'Tipo do documento médico do paciente',
    enum: Object.keys(PatientDocumentType),
    example: 'LABORATORY_EXAM',
  })
  public type: PatientDocumentType;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Descrição'),
  })
  @IsString({
    message: provideIsStringValidationMessage('Descrição'),
  })
  @IsUnique('PatientDocument', 'description', {
    message: 'Já existe um documento com esta descrição.',
  })
  @ApiProperty({
    description: 'Descrição do documento médico (deve ser única no sistema)',
    example: 'Hemograma completo - exame de rotina',
  })
  public description: string;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Data de Nascimento'),
  })
  @IsDate({ message: 'Data de nascimento deve estar no formato DD/MM/AAAA' })
  @ToLocalDate()
  @IsNotFutureDate()
  @ApiProperty({
    description: 'Data em que o exame foi realizado',
    example: '2024-01-15',
    type: String,
    format: 'date',
  })
  public examDate: string;

  @IsArray()
  @ArrayMinSize(1, {
    message: provideIsNotEmptyValidationMessage('Lista de Mídias'),
  })
  @ArrayMaxSize(20, {
    message: 'É permitido no máximo 20 arquivos por documento.',
  })
  @IsUUID('4', {
    each: true,
    message: provideIsUUIDValidationMessage('ID da Mídia'),
  })
  @ApiProperty({
    description: 'Lista de IDs das mídias vinculadas ao documento',
    type: [String],
    format: 'uuid',
  })
  public mediaIds: string[];

  @IsOptional()
  @IsString({
    message: provideIsStringValidationMessage('Nome do Solicitante'),
  })
  @ApiPropertyOptional()
  public requesterName?: string;

  @IsOptional()
  @IsString({
    message: provideIsStringValidationMessage('Local do Exame'),
  })
  @ApiPropertyOptional()
  public examLocation?: string;

  @IsOptional()
  @IsString({
    message: provideIsStringValidationMessage('Observações'),
  })
  @ApiPropertyOptional()
  public observations?: string;
}
