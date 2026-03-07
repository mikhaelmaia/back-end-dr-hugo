import { Injectable } from '@nestjs/common';
import { BaseMapper } from '../../base/base.mapper';
import { Media } from './entities/media.entity';
import { MediaDto } from './dtos/media.dto';
import {
  extractFilename,
  isHeic,
  convertHeicToJpeg,
  getMediaTypeFromFile,
  getMediaContentType,
} from 'src/core/utils/media.utils';
import { MediaType } from 'src/core/vo/consts/enums';

@Injectable()
export class MediaMapper extends BaseMapper<Media, MediaDto> {
  public toDto(entity: Media): MediaDto {
    const dto = new MediaDto();
    dto.id = entity.id;
    dto.filename = entity.filename;
    dto.type = entity.type;
    dto.size = entity.size;
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

  public async fromFile(
    file: Express.Multer.File,
    bucket: string,
    objectName: string,
    userId: string,
  ): Promise<{ media: Media; buffer: Buffer; contentType: string }> {
    const media = new Media();

    let buffer = file.buffer;
    let finalMimeType = getMediaTypeFromFile(file);
    let finalContentType = getMediaContentType(finalMimeType);

    if (isHeic(file.mimetype)) {
      buffer = await convertHeicToJpeg(file.buffer);
      finalMimeType = MediaType.JPEG;
      finalContentType = getMediaContentType(finalMimeType);
    }

    media.filename = extractFilename(file);
    media.type = finalMimeType;
    media.size = file.size;
    media.bucket = bucket;
    media.objectName = objectName;
    media.ownerUserId = userId;
    return { media, buffer, contentType: finalContentType };
  }
}
