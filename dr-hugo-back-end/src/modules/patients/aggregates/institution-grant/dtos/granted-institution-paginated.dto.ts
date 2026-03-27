import { ApiProperty } from '@nestjs/swagger';
import { GrantedInstitutionListItemDto } from './granted-institution-list-item.dto';

export class GrantedInstitutionPaginatedDto {
  @ApiProperty({
    description: 'Lista de instituições com acesso concedido',
    type: [GrantedInstitutionListItemDto],
  })
  public items: GrantedInstitutionListItemDto[];

  @ApiProperty({ description: 'Total de registros', example: 5 })
  public totalItems: number;

  @ApiProperty({ description: 'Página atual', example: 1 })
  public currentPage: number;

  @ApiProperty({ description: 'Total de páginas', example: 1 })
  public totalPages: number;
}
