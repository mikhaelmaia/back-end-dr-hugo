import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InstitutionalUserRole } from 'src/core/vo/consts/enums';

export class PatientAccessCodeDto {
  @ApiProperty({
    description:
      'Código de acesso alfanumérico gerado para o usuário institucional',
    example: 'ABC123',
    type: String,
  })
  public code: string;

  @ApiProperty({
    description:
      'QR Code em base64 contendo o código de acesso (gerado automaticamente)',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
    type: String,
  })
  public qrCode: string;

  @ApiProperty({
    description: 'Data e hora de expiração do código de acesso',
    example: '2024-01-15T10:30:00.000Z',
    type: Date,
    format: 'date-time',
  })
  public expiresAt: Date;

  @ApiProperty({
    description: 'Tempo total de validade do código em milissegundos',
    example: 3600000,
    type: Number,
  })
  public totalTimeMs: number;

  @ApiProperty({
    description: 'Tempo decorrido desde a criação do código em milissegundos',
    example: 1500000,
    type: Number,
  })
  public elapsedTimeMs: number;

  @ApiProperty({
    description: 'Tempo restante até a expiração em milissegundos',
    example: 2100000,
    type: Number,
  })
  public remainingTimeMs: number;

  @ApiProperty({
    description:
      'Tipo de usuário institucional para o qual o código foi gerado',
    enum: InstitutionalUserRole,
    enumName: 'InstitutionalUserRole',
    example: 'DOCTOR',
  })
  public role: InstitutionalUserRole;

  @ApiPropertyOptional({
    description:
      'Lista de IDs dos documentos específicos para os quais o código fornece acesso (se vazio, dá acesso a todos os documentos)',
    type: [String],
    format: 'uuid',
    example: [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
    ],
  })
  public documentsIds?: string[];

  @ApiProperty({
    description:
      'Indica se o acesso é persistente (não expira automaticamente)',
    type: Boolean,
    example: false,
  })
  public persistent: boolean;

  @ApiProperty({
    description:
      'Indica se o código concede acesso a todos os documentos do paciente (incluindo passados)',
    type: Boolean,
    example: false,
  })
  public allowAccessToAllDocuments: boolean;

  @ApiProperty({
    description: 'Identificador do paciente que gerou o código de acesso',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    type: String,
  })
  public patientId: string;
}
