import { BaseEntity } from './base.entity';
import { BaseEntityDto } from './base.entity.dto';
import { BaseService } from './base.service';
import type { Page, PaginationParams } from '../vo/types/types';
import type { FindOneOptions } from 'typeorm';

export abstract class BaseController<
  TEntity extends BaseEntity,
  TDto extends BaseEntityDto<TEntity>,
  TService extends BaseService<TEntity, TDto, any, any>,
> {
  protected constructor(protected readonly service: TService) {}

  protected async create(dto: TDto): Promise<TDto> {
    return this.service.create(dto);
  }

  protected async findAll(
    params: PaginationParams<TEntity>,
  ): Promise<Page<TDto>> {
    return this.service.findAll(params);
  }

  protected async findById(id: string): Promise<TDto> {
    return this.service.findById(id);
  }

  protected async update(id: string, updateDto: Partial<TDto>): Promise<void> {
    this.service.update(id, updateDto);
  }

  protected async softDelete(id: string): Promise<void> {
    await this.service.softDelete(id);
  }

  protected async hardDelete(id: string): Promise<void> {
    await this.service.delete(id);
  }

  protected async count(options?: any): Promise<number> {
    return this.service.count(options);
  }

  protected async exists(options?: FindOneOptions<TEntity>): Promise<boolean> {
    return this.service.exists(options);
  }
}
