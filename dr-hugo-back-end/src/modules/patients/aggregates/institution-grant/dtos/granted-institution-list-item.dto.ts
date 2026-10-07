import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MedicalInstitutionType } from 'src/core/vo/consts/enums';

export class GrantedInstitutionListItemDto {
  @ApiProperty({
    description: 'Identificador da concessão',
    format: 'uuid',
    type: String,
  })
  public grantId: string;

  @ApiProperty({
    description: 'Identificador da instituição',
    format: 'uuid',
    type: String,
  })
  public institutionId: string;

  @ApiProperty({
    description: 'Nome da instituição',
    type: String,
  })
  public name: string;

  @ApiProperty({
    description: 'Indica se o paciente curtiu a concessão',
    type: Boolean,
  })
  public liked: boolean;

  @ApiProperty({
    description: 'Tipo de instituição médica',
    enum: MedicalInstitutionType,
    enumName: 'MedicalInstitutionType',
  })
  public medicalInstitutionType: MedicalInstitutionType;

  @ApiPropertyOptional({
    description: 'Descrição do tipo de instituição quando o tipo é "Outros"',
    type: String,
  })
  public otherMedicalInstitutionType?: string;
}
