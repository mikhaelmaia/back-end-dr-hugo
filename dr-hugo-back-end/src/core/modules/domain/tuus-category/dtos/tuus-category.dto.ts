import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityDto } from 'src/core/base/base.entity.dto';
import { TuusCategory } from '../entities/tuus-category.entity';

export class TuusCategoryDto extends BaseEntityDto<TuusCategory> {
  @ApiProperty({
    description: 'Código TUSS do exame',
    example: '40301010',
  })
  public tussCode: string;

  @ApiProperty({
    description: 'Nome do exame',
    example: 'Hemograma Completo',
  })
  public name: string;

  @ApiProperty({
    description: 'Categoria do exame',
    enum: [
      'LABORATORIAL',
      'IMAGEM',
      'IMAGEM/LAUDO',
      'DIAGNÓSTICO ESPECIALIZADO',
      'EXAME FUNCIONAL',
    ],
    example: 'LABORATORIAL',
  })
  public category:
    | 'LABORATORIAL'
    | 'IMAGEM'
    | 'IMAGEM/LAUDO'
    | 'DIAGNÓSTICO ESPECIALIZADO'
    | 'EXAME FUNCIONAL';
}
