import {
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsUUID,
  ArrayNotEmpty,
  ArrayMaxSize,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { InstitutionalUserRole } from 'src/core/vo/consts/enums';
import { IsEnumKey } from 'src/core/vo/validators/is-enum-key.validator';
import { ExistsIn } from 'src/core/vo/validators/exists-in.validator';
import {
  provideIsNotEmptyValidationMessage,
  provideIsUUIDValidationMessage,
  provideArrayNotEmptyValidationMessage,
  provideArrayMaxSizeValidationMessage,
} from 'src/core/vo/consts/validation-messages';
import { findEnumValueByKeyOrValue } from 'src/core/utils/enum.utils';

export class CreatePatientAccessCodeDto {
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Tipo de Usuário'),
  })
  @IsEnumKey(InstitutionalUserRole, {
    message: `Tipo de usuário deve ser um dos seguintes valores: ${Object.keys(InstitutionalUserRole).join(', ')}`,
  })
  @Transform(({ value }) =>
    findEnumValueByKeyOrValue(InstitutionalUserRole, value),
  )
  @ApiProperty({
    description: 'Tipo de usuário institucional que terá acesso aos documentos',
    enum: Object.keys(InstitutionalUserRole),
    example: 'DOCTOR',
    enumName: 'InstitutionalUserRole',
  })
  public role: InstitutionalUserRole;

  @IsOptional()
  @IsArray({
    message: 'Lista de IDs de documentos deve ser um array',
  })
  @ArrayNotEmpty({
    message: provideArrayNotEmptyValidationMessage('documento'),
  })
  @ArrayMaxSize(20, {
    message: provideArrayMaxSizeValidationMessage('documentos', 20),
  })
  @IsUUID('4', {
    each: true,
    message: provideIsUUIDValidationMessage('ID do Documento'),
  })
  @ExistsIn('dv_patient_document', 'id', {
    message: 'Um ou mais documentos não foram encontrados',
  })
  @ApiPropertyOptional({
    description:
      'Lista de IDs dos documentos específicos para os quais o código dará acesso (opcional - se não informado, dará acesso a todos os documentos do paciente)',
    type: [String],
    format: 'uuid',
    example: [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
    ],
    maxItems: 20,
  })
  public documentsIds?: string[];

  @IsOptional()
  @IsBoolean({
    message: 'Persistent deve ser um valor booleano',
  })
  @ApiPropertyOptional({
    description:
      'Define se o acesso será persistente, não expirando automaticamente (padrão: false)',
    type: Boolean,
    example: false,
    default: false,
  })
  public persistent?: boolean;
}
