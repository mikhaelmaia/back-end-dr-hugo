import { Injectable, NotFoundException } from '@nestjs/common';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { BaseEntity } from './base.entity';
import { BaseEntityDto } from './base.entity.dto';
import { BaseRepository } from './base.repository';
import { BaseMapper } from './base.mapper';
import { Optional } from '../utils/optional';
import { Page, PaginationParams } from '../vo/types/types';

@Injectable()
export abstract class BaseService<
  TEntity extends BaseEntity,
  TDto extends BaseEntityDto<TEntity>,
  TRepository extends BaseRepository<TEntity>,
  TMapper extends BaseMapper<TEntity, TDto>,
> {
  protected readonly ENTITY_NOT_FOUND: string = 'Entity not found';

  protected constructor(
    protected readonly repository: TRepository,
    protected readonly mapper: TMapper,
  ) {}

  public async create(dto: TDto): Promise<TDto> {
    const entity = this.mapper.toEntity(dto);
    await this.beforeCreate(entity);
    const savedEntity = await this.repository.save(entity);
    await this.postCreate(savedEntity);
    return this.mapper.toDto(savedEntity);
  }

  public async findAll(params: PaginationParams<TEntity>): Promise<Page<TDto>> {
    const entities = await this.repository.findAll(params);
    const dtos = this.mapper.toDtos(entities.items);
    return {
      items: dtos,
      totalItems: entities.totalItems,
      currentPage: entities.currentPage,
      totalPages: entities.totalPages,
    };
  }

  public async findById(id: string): Promise<TDto> {
    const entity = await this.repository.findById(id);
    return Optional.ofNullable(entity)
      .map((e) => this.mapper.toDto(e))
      .orElseThrow(() => new NotFoundException(this.ENTITY_NOT_FOUND));
  }

  public async findOne(options: FindOneOptions<TEntity>): Promise<TDto | null> {
    const entity = await this.repository.findOne(options);
    return Optional.ofNullable(entity)
      .map((e) => this.mapper.toDto(e))
      .orElseThrow(() => new NotFoundException(this.ENTITY_NOT_FOUND));
  }

  public async update(id: string, updateDto: Partial<TDto>): Promise<TDto> {
    const entityFound = await this.repository.findById(id);
    Optional.ofNullable(entityFound).orElseThrow(
      () => new NotFoundException(this.ENTITY_NOT_FOUND),
    );

    const entityToUpdate = {
      ...entityFound,
      ...this.mapper.toEntity(updateDto),
      id,
    };

    await this.beforeUpdate(entityToUpdate, entityFound);
    const updatedEntity = await this.repository.save(entityToUpdate as TEntity);
    await this.postUpdate(updatedEntity);
    return this.mapper.toDto(updatedEntity);
  }

  public async softDelete(id: string): Promise<boolean> {
    const entity = await this.repository.findById(id);
    Optional.ofNullable(entity).orElseThrow(
      () => new NotFoundException(this.ENTITY_NOT_FOUND),
    );
    await this.beforeSoftDelete(entity!);
    const deleted = await this.repository.softDelete(id);
    await this.postSoftDelete(entity!);
    return deleted;
  }

  public async delete(id: string): Promise<boolean> {
    const entity = await this.repository.findById(id);
    Optional.ofNullable(entity).orElseThrow(
      () => new NotFoundException(this.ENTITY_NOT_FOUND),
    );
    await this.beforeDelete(entity!);
    const deleted = await this.repository.delete(id);
    await this.postDelete(entity!);
    return deleted;
  }

  public async count(options?: FindManyOptions<TEntity>): Promise<number> {
    return this.repository.count(options);
  }

  public async existsById(id: string): Promise<boolean> {
    return this.repository.exists({ where: { id } as any });
  }

  public async exists(options: FindOneOptions<TEntity>): Promise<boolean> {
    return this.repository.exists(options);
  }

  protected beforeCreate(entity: TEntity): Promise<void> {
    return Promise.resolve();
  }

  protected postCreate(entity: TEntity): Promise<void> {
    return Promise.resolve();
  }

  protected beforeUpdate(
    entityReceived: TEntity,
    entityFound: TEntity,
  ): Promise<void> {
    return Promise.resolve();
  }

  protected postUpdate(entity: TEntity): Promise<void> {
    return Promise.resolve();
  }

  protected beforeDelete(entity: TEntity): Promise<void> {
    return Promise.resolve();
  }

  protected postDelete(entity: TEntity): Promise<void> {
    return Promise.resolve();
  }

  protected beforeSoftDelete(entity: TEntity): Promise<void> {
    return Promise.resolve();
  }

  protected postSoftDelete(entity: TEntity): Promise<void> {
    return Promise.resolve();
  }
}
