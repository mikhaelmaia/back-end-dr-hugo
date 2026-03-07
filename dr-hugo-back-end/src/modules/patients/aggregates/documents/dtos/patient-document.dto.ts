import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
import { Transform } from 'class-transformer';
import { PatientDocumentType } from 'src/core/vo/consts/enums';
import { PatientDocumentMediaDto } from './patient-document-media.dto';
import { IsUnique } from 'src/core/vo/validators/is-unique.validator';
import { IsEnumKey } from 'src/core/vo/validators/is-enum-key.validator';
import { ToLocalDate } from 'src/core/vo/transformers/to-local-date.transformer';
import { IsNotFutureDate } from 'src/core/vo/validators/is-not-future-date.validator';
import {
  findEnumValueByKeyOrValue,
  findEnumKeyByValue,
} from 'src/core/utils/enum.utils';
import {
  provideIsNotEmptyValidationMessage,
  provideIsStringValidationMessage,
  provideIsUUIDValidationMessage,
} from 'src/core/vo/consts/validation-messages';

export class PatientDocumentDto {
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('ID do Documento'),
  })
  @IsUUID('4', {
    message: provideIsUUIDValidationMessage('ID do Documento'),
  })
  @ApiProperty({
    description: 'Identificador único do documento',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  public id: string;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Tipo de Documento'),
  })
  @IsEnumKey(PatientDocumentType, {
    message: `Tipo de Documento deve ser um dos seguintes valores: ${Object.keys(PatientDocumentType).join(', ')}`,
  })
  @Transform(
    ({ value }) => findEnumValueByKeyOrValue(PatientDocumentType, value),
    { toClassOnly: true },
  )
  @Transform(({ value }) => findEnumKeyByValue(PatientDocumentType, value), {
    toPlainOnly: true,
  })
  @ApiProperty({
    description: 'Tipo do documento médico',
    enum: Object.keys(PatientDocumentType),
    example: PatientDocumentType.LABORATORY_EXAM,
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
    description: 'Descrição do documento',
    example: 'Hemograma completo - exame de rotina',
  })
  public description: string;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Data do Exame'),
  })
  @IsDate({ message: 'Data do exame deve estar no formato DD/MM/AAAA' })
  @ToLocalDate()
  @IsNotFutureDate()
  @ApiProperty({
    description: 'Data em que o exame foi realizado',
    example: '2024-01-15',
    type: String,
    format: 'date',
  })
  public examDate: Date;

  @IsOptional()
  @IsString({
    message: provideIsStringValidationMessage('Nome do Solicitante'),
  })
  @ApiPropertyOptional({
    description: 'Nome do médico solicitante',
    example: 'Dr. João Silva',
  })
  public requesterName?: string;

  @IsOptional()
  @IsString({
    message: provideIsStringValidationMessage('Local do Exame'),
  })
  @ApiPropertyOptional({
    description: 'Local onde o exame foi realizado',
    example: 'Hospital Albert Einstein',
  })
  public examLocation?: string;

  @IsOptional()
  @IsString({
    message: provideIsStringValidationMessage('Observações'),
  })
  @ApiPropertyOptional({
    description: 'Observações adicionais sobre o documento',
    example: 'Paciente em jejum de 12 horas',
  })
  public observations?: string;

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

  @ApiProperty({
    description: 'Lista de mídias associadas ao documento com metadados',
    type: [PatientDocumentMediaDto],
    readOnly: true,
  })
  public medias: PatientDocumentMediaDto[];

  @ApiProperty({
    description: 'Data de criação do documento',
    example: '2024-01-15T10:30:00.000Z',
    type: String,
    format: 'date-time',
    readOnly: true,
  })
  public createdAt: Date;
}
