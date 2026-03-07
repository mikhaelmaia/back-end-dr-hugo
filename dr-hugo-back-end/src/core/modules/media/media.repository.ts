import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Media } from './entities/media.entity';
import { Repository } from 'typeorm/repository/Repository';
import { BaseRepository } from '../../base/base.repository';
import { LessThanOrEqual } from 'typeorm';

@Injectable()
export class MediaRepository extends BaseRepository<Media> {
  constructor(
    @InjectRepository(Media)
    repository: Repository<Media>,
  ) {
    super(repository);
    this.alias = 'media';
  }

  public async findByIdAndOwnerId(
    id: string,
    ownerUserId: string,
  ): Promise<Media | null> {
    return this.createBaseQuery()
      .where('media.id = :id', { id })
      .andWhere('media.ownerUserId = :ownerUserId', { ownerUserId })
      .getOne();
  }

  public async findTempMediasOlderThan(date: Date): Promise<Media[]> {
    return this.repository.find({
      where: {
        bucket: 'temp',
        createdAt: LessThanOrEqual(date),
      },
    });
  }

  public async existsByIdAndOwnerId(
    id: string,
    ownerUserId: string,
  ): Promise<boolean> {
    const count = await this.createBaseQuery()
      .where('media.id = :id', { id })
      .andWhere('media.ownerUserId = :ownerUserId', { ownerUserId })
      .getCount();

    return count > 0;
  }

  public async existsByIdsAndOwnerId(
    mediaIds: string[],
    ownerUserId: string,
  ): Promise<boolean> {
    const count = await this.createBaseQuery()
      .where('media.id IN (:...mediaIds)', { mediaIds })
      .andWhere('media.ownerUserId = :ownerUserId', { ownerUserId })
      .getCount();

    return count === mediaIds.length;
  }
}
