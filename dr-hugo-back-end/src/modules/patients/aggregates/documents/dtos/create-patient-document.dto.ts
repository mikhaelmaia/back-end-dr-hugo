import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PatientDocumentType } from 'src/core/vo/consts/enums';
import {
  provideIsEnumValidationMessage,
  provideIsNotEmptyValidationMessage,
  provideIsStringValidationMessage,
  provideIsDateStringValidationMessage,
  provideIsUUIDValidationMessage,
} from 'src/core/vo/consts/validation-messages';

export class CreatePatientDocumentDto {
  @IsEnum(PatientDocumentType, {
    message: (args) =>
      provideIsEnumValidationMessage(args, PatientDocumentType),
  })
  @ApiProperty({
    description: 'Tipo do documento médico do paciente',
    enum: PatientDocumentType,
    enumName: 'PatientDocumentType',
    example: PatientDocumentType.LABORATORY_EXAM,
  })
  public type: PatientDocumentType;

  @IsString({
    message: provideIsStringValidationMessage('Descrição'),
  })
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Descrição'),
  })
  @ApiProperty({
    description: 'Descrição do documento médico',
    example: 'Hemograma completo - exame de rotina',
    type: String,
  })
  public description: string;

  @IsDateString(
    {},
    {
      message: provideIsDateStringValidationMessage('Data do Exame'),
    },
  )
  @ApiProperty({
    description: 'Data em que o exame foi realizado',
    example: '2024-01-15',
    type: String,
    format: 'date',
  })
  public examDate: string;

  @IsUUID(undefined, {
    message: provideIsUUIDValidationMessage('ID da Mídia'),
  })
  @ApiProperty({
    description: 'ID da mídia que contém o documento',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    type: String,
  })
  public mediaId: string;

  @IsOptional()
  @IsString({
    message: provideIsStringValidationMessage('Nome do Solicitante'),
  })
  @ApiPropertyOptional({
    description: 'Nome do médico ou profissional que solicitou o exame',
    example: 'Dr. João Silva',
    type: String,
  })
  public requesterName?: string;

  @IsOptional()
  @IsString({
    message: provideIsStringValidationMessage('Local do Exame'),
  })
  @ApiPropertyOptional({
    description: 'Local onde o exame foi realizado',
    example: 'Hospital São Lucas - Laboratório',
    type: String,
  })
  public examLocation?: string;

  @IsOptional()
  @IsString({
    message: provideIsStringValidationMessage('Observações'),
  })
  @ApiPropertyOptional({
    description: 'Observações adicionais sobre o documento',
    example: 'Paciente em jejum de 12 horas',
    type: String,
  })
  public observations?: string;
}
