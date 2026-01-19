import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Audit } from './entities/audit.entity';
import { Repository } from 'typeorm';
import { AuditEventType } from '../../vo/consts/enums';
import { BaseRepository } from '../../base/base.repository';

@Injectable()
export class AuditRepository extends BaseRepository<Audit> {
  constructor(
    @InjectRepository(Audit)
    repository: Repository<Audit>,
  ) {
    super(repository);
    this.alias = 'audit';
  }

  public async findAllWithFilters(
    eventType?: AuditEventType,
    entityName?: string,
    entityId?: string,
    authorId?: string,
  ): Promise<Audit[]> {
    const query = this.createBaseQuery()
      .leftJoinAndSelect('audit.author', 'author')
      .leftJoinAndSelect('audit.fingerprint', 'fingerprint')
      .addOrderBy('audit.createdAt', 'DESC');

    if (eventType) {
      query.andWhere('audit.eventType = :eventType', { eventType });
    }
    if (entityName) {
      query.andWhere('audit.entityName = :entityName', { entityName });
    }
    if (entityId) {
      query.andWhere('audit.entityId = :entityId', { entityId });
    }
    if (authorId) {
      query.andWhere('author.id = :authorId', { authorId });
    }

    return query.getMany();
  }

  public async findByIdWithRelations(id: string): Promise<Audit | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['author', 'fingerprint'],
      withDeleted: false,
    });
  }
}
