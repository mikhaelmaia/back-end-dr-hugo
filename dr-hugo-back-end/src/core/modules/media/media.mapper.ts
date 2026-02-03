import { Injectable } from '@nestjs/common';
import { BaseMapper } from '../../base/base.mapper';
import { Media } from './entities/media.entity';
import { MediaDto } from './dtos/media.dto';

@Injectable()
export class MediaMapper extends BaseMapper<Media, MediaDto> {
  public toDto(entity: Media): MediaDto {
    const dto = new MediaDto();
    dto.id = entity.id;
    dto.filename = entity.filename;
    dto.type = entity.type;
    dto.size = entity.size;
    dto.bucket = entity.bucket;
    dto.objectName = entity.objectName;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  public toEntity(dto: Partial<MediaDto>): Media {
    const entity = new Media();
    if (dto.id) entity.id = dto.id;
    if (dto.filename) entity.filename = dto.filename;
    if (dto.type) entity.type = dto.type;
    if (dto.size) entity.size = dto.size;
    if (dto.bucket) entity.bucket = dto.bucket;
    if (dto.objectName) entity.objectName = dto.objectName;
    return entity;
  }
}
