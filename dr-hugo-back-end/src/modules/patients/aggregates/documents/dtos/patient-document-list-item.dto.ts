import { ApiProperty } from '@nestjs/swagger';

export class PatientDocumentListItemDto {
  @ApiProperty({
    description: 'ID do documento',
    format: 'uuid',
  })
  public id: string;

  @ApiProperty({
    description: 'Descrição do documento',
  })
  public description: string;

  @ApiProperty({
    description: 'Data do exame formatada (DD/MM/YYYY)',
    example: '15/01/2024',
  })
  public examDate: string;
}
