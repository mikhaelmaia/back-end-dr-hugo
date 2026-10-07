import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import {
  provideIsEnumValidationMessage,
  provideIsNotEmptyValidationMessage,
  provideIsUUIDValidationMessage,
} from 'src/core/vo/consts/validation-messages';
import { InstitutionalUserRole } from 'src/core/vo/consts/enums';
import { ExistsInGrant } from 'src/core/vo/validators/exists-in-grant.validator';

export class RevokePatientPermissionGrantDto {
  @ApiProperty({
    description: 'Identificador da concessão a ser revogada',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    type: String,
  })
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('ID da Concessão'),
  })
  @IsUUID(4, { message: provideIsUUIDValidationMessage('ID da Concessão') })
  @ExistsInGrant({ message: 'Concessão não encontrada' })
  public id: string;

  @ApiProperty({
    description:
      'Tipo do profissional ao qual a concessão pertence (usado apenas quando o paciente está revogando)',
    enum: InstitutionalUserRole,
    enumName: 'InstitutionalUserRole',
    example: InstitutionalUserRole.DOCTOR,
  })
  @IsNotEmpty({ message: provideIsNotEmptyValidationMessage('Perfil') })
  @IsEnum(InstitutionalUserRole, {
    message: provideIsEnumValidationMessage('Perfil', InstitutionalUserRole),
  })
  public role: InstitutionalUserRole;
}
