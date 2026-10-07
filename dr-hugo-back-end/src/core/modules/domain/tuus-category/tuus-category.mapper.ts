import { Injectable } from '@nestjs/common';
import { BaseMapper } from 'src/core/base/base.mapper';
import { TuusCategory } from './entities/tuus-category.entity';
import { TuusCategoryDto } from './dtos/tuus-category.dto';

@Injectable()
export class TuusCategoryMapper extends BaseMapper<
  TuusCategory,
  TuusCategoryDto
> {
  toEntity(dto: Partial<TuusCategoryDto>): TuusCategory {
    throw new Error('Method not implemented.');
  }

  public toDto(entity: TuusCategory): TuusCategoryDto {
    const tuusCategoryDto = new TuusCategoryDto();
    tuusCategoryDto.id = entity.id;
    tuusCategoryDto.tussCode = entity.tussCode;
    tuusCategoryDto.name = entity.name;
    tuusCategoryDto.category = entity.category;
    tuusCategoryDto.createdAt = entity.createdAt;
    tuusCategoryDto.updatedAt = entity.updatedAt;
    return tuusCategoryDto;
  }

  public toDtos(entities: TuusCategory[]): TuusCategoryDto[] {
    return entities.map((entity) => this.toDto(entity));
  }
}
