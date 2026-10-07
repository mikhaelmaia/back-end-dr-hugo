import { ApiPropertyOptional } from '@nestjs/swagger';

export class InsightsTotalsDto {
  @ApiPropertyOptional({
    description:
      'Total de documentos do paciente. Presente apenas para pacientes.',
    type: Number,
    example: 12,
  })
  public totalDocuments?: number;

  @ApiPropertyOptional({
    description:
      'Total de médicos com concessão de acesso ativa. Presente apenas para pacientes.',
    type: Number,
    example: 3,
  })
  public totalDoctorsGranted?: number;

  @ApiPropertyOptional({
    description:
      'Total de instituições com concessão de acesso ativa. Presente apenas para pacientes.',
    type: Number,
    example: 1,
  })
  public totalInstitutionsGranted?: number;

  @ApiPropertyOptional({
    description:
      'Total de pacientes com concessão de acesso ativa. Presente apenas para médicos e instituições.',
    type: Number,
    example: 20,
  })
  public totalPatientsGranted?: number;

  @ApiPropertyOptional({
    description:
      'Total de concessões de acesso concedidas no mês corrente. Presente apenas para médicos e instituições.',
    type: Number,
    example: 5,
  })
  public totalPatientsGrantedThisMonth?: number;
}
