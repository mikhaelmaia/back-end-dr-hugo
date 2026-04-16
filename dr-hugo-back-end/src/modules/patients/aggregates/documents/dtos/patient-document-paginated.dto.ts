import { ApiProperty } from '@nestjs/swagger';
import { PatientDocumentListItemDto } from './patient-document-list-item.dto';

export class PatientDocumentPaginatedDto {
  @ApiProperty({
    description:
      'Documentos agrupados por mês (chave: YYYY-MM, valor: array de documentos)',
    example: {
      '2024-01': [
        {
          id: 'uuid-1',
          type: 'LABORATORY_EXAM',
          description: 'Hemograma completo',
          examDate: '2024-01-15',
          requesterName: 'Dr. João Silva',
          examLocation: 'Hospital Albert Einstein',
        },
      ],
      '2024-02': [
        {
          id: 'uuid-2',
          type: 'PRESCRIPTION',
          description: 'Receita médica',
          examDate: '2024-02-10',
          requesterName: 'Dr. Maria Santos',
        },
      ],
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

  @ApiProperty({
    description:
      'IDs dos documentos atualmente liberados na concessão. ' +
      'Presente apenas quando o perfil consultado é o próprio paciente, ' +
      'para controle de quais documentos estão compartilhados com o médico.',
    type: [String],
    required: false,
    nullable: true,
  })
  public grantDocumentsIds?: string[] | null;

  @ApiProperty({
    description:
      'Indica se o médico tem acesso a todos os documentos do paciente. ' +
      'Presente apenas quando o perfil consultado é o próprio paciente.',
    type: Boolean,
    required: false,
    nullable: true,
  })
  public allowAccessToAllDocuments?: boolean | null;

  @ApiProperty({
    description:
      'Indica se documentos futuros sao automaticamente acessiveis ao medico. ' +
      'Presente apenas quando o perfil consultado e o proprio paciente.',
    type: Boolean,
    required: false,
    nullable: true,
  })
  public persistent?: boolean | null;
}
