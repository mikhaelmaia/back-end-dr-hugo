import { ApiProperty } from '@nestjs/swagger';
import { PatientDocumentListItemDto } from './patient-document-list-item.dto';

export class PatientDocumentPaginatedDto {
  @ApiProperty({
    description: 'Documentos agrupados por mês (chave: YYYY-MM, valor: array de documentos)',
    example: {
      '2024-01': [
        {
          id: 'uuid-1',
          type: 'LABORATORY_EXAM', 
          description: 'Hemograma completo',
          examDate: '2024-01-15',
          requesterName: 'Dr. João Silva',
          examLocation: 'Hospital Albert Einstein'
        }
      ],
      '2024-02': [
        {
          id: 'uuid-2',
          type: 'PRESCRIPTION',
          description: 'Receita médica',
          examDate: '2024-02-10',
          requesterName: 'Dr. Maria Santos'
        }
      ]
    },
  })
  public items: Record<string, PatientDocumentListItemDto[]>;

  @ApiProperty({
    description: 'Total de itens disponíveis',
    example: 150,
  })
  public totalItems: number;

  @ApiProperty({
    description: 'Página atual',
    example: 1,
  })
  public currentPage: number;

  @ApiProperty({
    description: 'Total de páginas disponíveis',
    example: 15,
  })
  public totalPages: number;
}
