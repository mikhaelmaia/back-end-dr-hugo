import {
  Repository,
  SelectQueryBuilder,
  DeepPartial,
  FindOneOptions,
  QueryDeepPartialEntity,
  InsertResult,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { FilterParams, Page, PaginationParams } from '../vo/types/types';
import { Logger } from '@nestjs/common';
import { isInvalidId } from '../utils/format.utils';

export abstract class BaseRepository<TEntity extends BaseEntity> {
  protected alias = 'entity';
  protected readonly logger = new Logger(this.constructor.name);

  protected constructor(protected readonly repository: Repository<TEntity>) {}

  public insert(data: QueryDeepPartialEntity<TEntity>): Promise<InsertResult> {
    return this.repository.insert(data);
  }

  public create(data: DeepPartial<TEntity>): TEntity {
    return this.repository.create(data);
  }

  public save(entity: TEntity): Promise<TEntity> {
    return this.repository.save(entity);
  }

  public findById(id: string): Promise<TEntity | null> {
    if (isInvalidId(id)) {
      return null;
    }

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
    if (isInvalidId(id)) {
      return false;
    }

    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  public async softDelete(id: string): Promise<boolean> {
    if (isInvalidId(id)) {
      return false;
    }

    const result = await this.repository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  public existsById(id: string): Promise<boolean> {
    if (isInvalidId(id)) {
      return Promise.resolve(false);
    }

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

    this.applyFilters(qb, params.filter);
    this.applySorting(qb, params.sortBy, params.sortOrder);
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
      .andWhere(`${this.alias}.deletedAt IS NULL`);
  }

  protected applyFilters(
    qb: SelectQueryBuilder<TEntity>,
    filter?: FilterParams<TEntity>,
    alias = this.alias,
  ): void {
    if (!filter) return;

    Object.entries(filter).forEach(([field, value]) => {
      if (value === undefined || value === null) return;

      const paramKey = this.generateParamKey(field);

      this.applyFieldFilter(qb, field, value, paramKey, alias);
    });
  }

  protected applySorting(
    qb: SelectQueryBuilder<TEntity>,
    sortBy?: keyof TEntity,
    sortOrder: 'ASC' | 'DESC' = 'ASC',
    alias = this.alias,
  ): void {
    if (!sortBy) return;

    const allowedColumns = this.getAllowedSortColumns();

    if (!allowedColumns.includes(sortBy)) {
      this.logger.warn(`Invalid sort column attempted: ${String(sortBy)}`);
      return;
    }

    qb.orderBy(`${alias}.${String(sortBy)}`, sortOrder);
  }

  protected applyPagination(
    qb: SelectQueryBuilder<TEntity>,
    page: number,
    limit: number,
  ): void {
    qb.take(limit).skip((page - 1) * limit);
  }

  protected getAllowedSortColumns(): (keyof TEntity)[] {
    return ['id', 'createdAt', 'updatedAt'];
  }

  private generateParamKey(field: string): string {
    return `${field}_${Math.random().toString(36).substring(2, 8)}`;
  }

  private applyFieldFilter(
    qb: SelectQueryBuilder<TEntity>,
    field: string,
    value: any,
    paramKey: string,
    alias: string,
  ): void {
    if (this.isOperatorObject(value)) {
      this.applyOperatorFilter(qb, field, value, paramKey, alias);
      return;
    }

    this.applySimpleFilter(qb, field, value, paramKey, alias);
  }

  private isOperatorObject(value: any): boolean {
    return typeof value === 'object' && !Array.isArray(value);
  }

  private applySimpleFilter(
    qb: SelectQueryBuilder<TEntity>,
    field: string,
    value: any,
    paramKey: string,
    alias: string,
  ): void {
    qb.andWhere(`${alias}.${field} = :${paramKey}`, {
      [paramKey]: value,
    });
  }

  private applyOperatorFilter(
    qb: SelectQueryBuilder<TEntity>,
    field: string,
    value: any,
    paramKey: string,
    alias: string,
  ): void {
    const column = `${alias}.${field}`;

    if (value.eq !== undefined) {
      qb.andWhere(`${column} = :${paramKey}`, {
        [paramKey]: value.eq,
      });
    }

    if (value.like) {
      qb.andWhere(`${column} LIKE :${paramKey}`, {
        [paramKey]: value.like,
      });
    }

    if (value.ilike) {
      qb.andWhere(`${column} ILIKE :${paramKey}`, {
        [paramKey]: value.ilike,
      });
    }

    if (value.in) {
      qb.andWhere(`${column} IN (:...${paramKey})`, {
        [paramKey]: value.in,
      });
    }

    if (value.gte !== undefined) {
      qb.andWhere(`${column} >= :${paramKey}`, {
        [paramKey]: value.gte,
      });
    }

    if (value.lte !== undefined) {
      qb.andWhere(`${column} <= :${paramKey}`, {
        [paramKey]: value.lte,
      });
    }

    if (value.between) {
      qb.andWhere(`${column} BETWEEN :${paramKey}_start AND :${paramKey}_end`, {
        [`${paramKey}_start`]: value.between[0],
        [`${paramKey}_end`]: value.between[1],
      });
    }
  }
}
