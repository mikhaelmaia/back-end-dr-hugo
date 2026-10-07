import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/core/base/base.repository';
import { Repository } from 'typeorm';
import { TuusCategory } from './entities/tuus-category.entity';

@Injectable()
export class TuusCategoryRepository extends BaseRepository<TuusCategory> {
  protected override alias = 'tuus';

  constructor(
    @InjectRepository(TuusCategory)
    repository: Repository<TuusCategory>,
  ) {
    super(repository);
  }

  public async findAllDescriptions(): Promise<string[]> {
    const result = await this.createBaseQuery()
      .select('tuus.name', 'tuusName')
      .orderBy('tuus.name', 'ASC')
      .getRawMany<{ tuusName: string }>();

    return result.map((row) => row.tuusName);
  }

  public async findAllDescriptionsPaged(
    page: number,
    limit: number,
  ): Promise<{ descriptions: string[]; totalItems: number }> {
    const qb = this.createBaseQuery()
      .select('tuus.name', 'tuusName')
      .orderBy('tuus.name', 'ASC');

    const totalItems = await qb.getCount();

    const result = await qb
      .limit(limit)
      .offset((page - 1) * limit)
      .getRawMany<{ tuusName: string }>();

    return {
      descriptions: result.map((row) => row.tuusName),
      totalItems,
    };
  }

  public async findDescriptionsPaged(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ descriptions: string[]; totalItems: number }> {
    const qb = this.createBaseQuery()
      .select('tuus.name', 'tuusName')
      .orderBy('tuus.name', 'ASC');

    if (search) {
      qb.where('LOWER(tuus.name) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    const totalItems = await qb.getCount();

    const result = await qb
      .limit(limit)
      .offset((page - 1) * limit)
      .getRawMany<{ tuusName: string }>();

    return {
      descriptions: result.map((row) => row.tuusName),
      totalItems,
    };
  }

  public async searchByName(
    term: string,
    category?:
      | 'LABORATORIAL'
      | 'IMAGEM'
      | 'IMAGEM/LAUDO'
      | 'DIAGNÓSTICO ESPECIALIZADO'
      | 'EXAME FUNCIONAL',
  ): Promise<TuusCategory[]> {
    const qb = this.createBaseQuery().where(
      'LOWER(tuus.name) LIKE LOWER(:term)',
      {
        term: `%${term}%`,
      },
    );

    if (category) {
      qb.andWhere('tuus.category = :category', { category });
    }

    return qb.orderBy('tuus.name', 'ASC').limit(20).getMany();
  }

  public async clear(): Promise<void> {
    await this.repository.clear();
  }
}
