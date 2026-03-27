import { ApiProperty } from '@nestjs/swagger';
import { GrantedDoctorListItemDto } from './granted-doctor-list-item.dto';

export class GrantedDoctorPaginatedDto {
  @ApiProperty({
    description: 'Lista de médicos com acesso concedido',
    type: [GrantedDoctorListItemDto],
  })
  public items: GrantedDoctorListItemDto[];

  @ApiProperty({ description: 'Total de registros', example: 10 })
  public totalItems: number;

  @ApiProperty({ description: 'Página atual', example: 1 })
  public currentPage: number;

  @ApiProperty({ description: 'Total de páginas', example: 2 })
  public totalPages: number;
}
