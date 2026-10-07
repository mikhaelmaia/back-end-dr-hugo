import { ApiProperty } from '@nestjs/swagger';
import { GrantedPatientListItemDto } from './granted-patient-list-item.dto';

export class GrantedPatientPaginatedDto {
  @ApiProperty({
    description: 'Lista de pacientes com acesso concedido',
    type: [GrantedPatientListItemDto],
  })
  public items: GrantedPatientListItemDto[];

  @ApiProperty({ description: 'Total de registros', example: 25 })
  public totalItems: number;

  @ApiProperty({ description: 'Página atual', example: 1 })
  public currentPage: number;

  @ApiProperty({ description: 'Total de páginas', example: 3 })
  public totalPages: number;
}
