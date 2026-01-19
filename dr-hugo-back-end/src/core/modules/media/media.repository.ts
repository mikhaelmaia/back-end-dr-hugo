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

  public async findTempMediasOlderThan(date: Date): Promise<Media[]> {
    return this.repository.find({
      where: {
        bucket: 'temp',
        createdAt: LessThanOrEqual(date),
      },
    });
  }
}
