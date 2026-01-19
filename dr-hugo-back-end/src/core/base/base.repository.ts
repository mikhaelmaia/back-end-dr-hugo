import {
  Repository,
  SelectQueryBuilder,
  DeepPartial,
  FindOneOptions,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Page, PaginationParams } from '../vo/types/types';
import { Logger } from '@nestjs/common';

export abstract class BaseRepository<TEntity extends BaseEntity> {
  protected alias = 'entity';
  protected readonly logger = new Logger(this.constructor.name);

  protected constructor(protected readonly repository: Repository<TEntity>) {}

  public create(data: DeepPartial<TEntity>): TEntity {
    return this.repository.create(data);
  }

  public save(entity: TEntity): Promise<TEntity> {
    return this.repository.save(entity);
  }

  public findById(id: string): Promise<TEntity | null> {
    return this.repository.findOne({
      where: { id } as any,
      withDeleted: false,
    });
  }

  public findOne(options: FindOneOptions<TEntity>): Promise<TEntity | null> {
    return this.repository.findOne({
      ...options,
      withDeleted: false,
    });
  }

  public async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  public async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  public existsById(id: string): Promise<boolean> {
    return this.exists({
      where: { id } as any,
      withDeleted: false,
    });
  }

  public exists(options: FindOneOptions<TEntity>): Promise<boolean> {
    return this.repository.exists(options);
  }

  public count(options?: FindOneOptions<TEntity>): Promise<number> {
    return this.repository.count(options);
  }

  public async findAll(
    params: PaginationParams<TEntity>,
  ): Promise<Page<TEntity>> {
    const qb = this.createBaseQuery();

    this.applyFilters(qb, params.filter, this.alias);
    this.applySorting(
      qb,
      params.sortBy as keyof TEntity,
      params.sortOrder,
      this.alias,
    );
    this.applyPagination(qb, params.page, params.limit);

    const [items, totalItems] = await qb.getManyAndCount();

    return {
      items,
      totalItems,
      currentPage: params.page,
      totalPages: Math.ceil(totalItems / params.limit),
    };
  }

  protected createBaseQuery(): SelectQueryBuilder<TEntity> {
    return this.repository
      .createQueryBuilder(this.alias)
      .where(`${this.alias}.deletedAt IS NULL`);
  }

  protected applyFilters(
    qb: SelectQueryBuilder<TEntity>,
    filter?: PaginationParams<TEntity>['filter'],
    alias = 'entity',
  ): void {
    if (!filter) return;

    Object.entries(filter).forEach(([field, value]) => {
      if (value === undefined || value === null) return;

      qb.andWhere(`${alias}.${field} = :${field}`, { [field]: value });
    });
  }

  protected applySorting(
    qb: SelectQueryBuilder<TEntity>,
    sortBy?: keyof TEntity,
    sortOrder: 'ASC' | 'DESC' = 'ASC',
    alias = 'entity',
  ): void {
    if (!sortBy) return;
    qb.orderBy(`${alias}.${String(sortBy)}`, sortOrder);
  }

  protected applyPagination(
    qb: SelectQueryBuilder<TEntity>,
    page: number,
    limit: number,
  ): void {
    qb.take(limit).skip((page - 1) * limit);
  }
}
