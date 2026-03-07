import { ApiProperty } from '@nestjs/swagger';

export class PatientDocumentAvailableFiltersDto {
  @ApiProperty({
    description: 'Tipos de documento disponíveis',
    example: ['EXAME_LABORATORIAL', 'RECEITUARIO'],
  })
  public documentTypes: string[];

  @ApiProperty({
    description: 'Descrições cadastradas nos documentos',
    example: ['Hemograma completo'],
  })
  public descriptions: string[];

  @ApiProperty({
    description: 'Médicos solicitantes',
    example: ['Dr. João Silva'],
  })
  public doctors: string[];

  @ApiProperty({
    description: 'Locais de realização',
    example: ['Hospital Albert Einstein'],
  })
  public locations: string[];

  @ApiProperty({
    description: 'Datas distintas de realização dos exames (formato ISO)',
    example: ['2024-01-15', '2023-03-10'],
  })
  public examDates: string[];
}
