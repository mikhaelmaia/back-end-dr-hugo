import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InstitutionalUserRole } from 'src/core/vo/consts/enums';

export class PatientPermissionGrantDto {
  @ApiProperty({
    description: 'Identificador único da concessão',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    type: String,
  })
  public id: string;

  @ApiProperty({
    description: 'Identificador do paciente ao qual o acesso foi concedido',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
    type: String,
  })
  public patientId: string;

  @ApiProperty({
    description:
      'Identificador do profissional (médico ou instituição) que recebeu o acesso',
    example: '550e8400-e29b-41d4-a716-446655440002',
    format: 'uuid',
    type: String,
  })
  public granteeId: string;

  @ApiProperty({
    description: 'Tipo de usuário institucional que recebeu a concessão',
    enum: InstitutionalUserRole,
    enumName: 'InstitutionalUserRole',
    example: InstitutionalUserRole.DOCTOR,
  })
  public role: InstitutionalUserRole;

  @ApiPropertyOptional({
    description:
      'IDs dos documentos específicos para os quais o acesso foi concedido. ' +
      'Se ausente, o acesso é para todos os documentos do paciente.',
    type: [String],
    format: 'uuid',
  })
  public documentsIds?: string[];

  @ApiPropertyOptional({
    description: 'Data e hora em que o acesso foi revogado pelo paciente',
    example: null,
    type: Date,
    format: 'date-time',
    nullable: true,
  })
  public revokedAt?: Date;

  @ApiProperty({
    description: 'Indica se o paciente marcou o profissional como favorito',
    type: Boolean,
    example: false,
  })
  public likedByPatient: boolean;

  @ApiProperty({
    description: 'Indica se o profissional marcou o paciente como favorito',
    type: Boolean,
    example: false,
  })
  public likedByGrantee: boolean;

  @ApiProperty({
    description:
      'Indica se a concessão é persistente (não expira automaticamente)',
    type: Boolean,
    example: false,
  })
  public persistent: boolean;

  @ApiProperty({
    description:
      'Indica se a concessão concede acesso a todos os documentos do paciente',
    type: Boolean,
    example: false,
  })
  public allowAccessToAllDocuments: boolean;

  @ApiProperty({
    description: 'Data e hora de criação da concessão',
    example: '2024-01-15T10:30:00.000Z',
    type: Date,
    format: 'date-time',
  })
  public createdAt: Date;
}
