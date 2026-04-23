import { Media } from './entities/media.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { MediaRepository } from './media.repository';
import { MediaDto } from './dtos/media.dto';
import { MediaMapper } from './media.mapper';
import { BaseService } from '../../base/base.service';
import { MinioService } from './minio/minio.service';
import { MinioBuckets } from './minio/minio.buckets';
import { acceptFalseThrows } from '../../utils/functions';
import { Optional } from '../../utils/optional';
import { MediaType } from '../../vo/consts/enums';
import { Cron, CronExpression } from '@nestjs/schedule';
import { randomUUID } from 'node:crypto';
import * as path from 'node:path';
import {
  extractFileTypeFromOriginalName,
  getMediaContentType,
  isAllowedMimeType,
} from 'src/core/utils/media.utils';
import { PassThrough } from 'node:stream';
import archiver from 'archiver';
import { MediaStreamResult } from 'src/core/vo/types/types';

@Injectable()
export class MediaService extends BaseService<
  Media,
  MediaDto,
  MediaRepository,
  MediaMapper
> {
  private readonly logger = new Logger(MediaService.name);
  private readonly MEDIA_TYPE_NOT_SUPPORTED = 'Tipo de mídia não suportado';
  private readonly MEDIA_NOT_FOUND = 'Mídia não encontrada';
  private readonly ACCESS_NOT_ALLOWED = 'Acesso negado ao recurso';

  constructor(
    repository: MediaRepository,
    mapper: MediaMapper,
    private readonly minioService: MinioService,
  ) {
    super(repository, mapper);
  }

  public async createMedia(
    file: Express.Multer.File,
    userId: string,
    bucket: MinioBuckets = MinioBuckets.TEMP,
  ): Promise<MediaDto> {
    acceptFalseThrows(
      isAllowedMimeType(file.mimetype),
      () => new BadRequestException(this.MEDIA_TYPE_NOT_SUPPORTED),
    );

    this.validateFileType(file);

    const objectName = this.generateObjectName(file);

    const { media, buffer, contentType } = await this.mapper.fromFile(
      file,
      bucket,
      objectName,
      userId,
    );

    await this.uploadToMinio(bucket, objectName, buffer, contentType);

    const savedMedia = await this.repository.save(media);

    return this.mapper.toDto(savedMedia);
  }

  public async findByIdAndOwnerId(
    id: string,
    ownerUserId: string,
  ): Promise<MediaDto | null> {
    const media = await this.repository.findByIdAndOwnerId(id, ownerUserId);
    return media ? this.mapper.toDto(media) : null;
  }

  public async validateOwnership(
    mediaIds: string[],
    ownerUserId: string,
  ): Promise<void> {
    const owned = await this.repository.existsByIdsAndOwnerId(
      mediaIds,
      ownerUserId,
    );

    acceptFalseThrows(
      owned,
      () => new ForbiddenException(this.ACCESS_NOT_ALLOWED),
    );
  }

  public async getStream(
    mediaId: string,
    ownerUserId: string,
  ): Promise<MediaStreamResult> {
    const media = await this.repository.findByIdAndOwnerId(
      mediaId,
      ownerUserId,
    );

    acceptFalseThrows(
      media !== null,
      () => new NotFoundException(this.MEDIA_NOT_FOUND),
    );

    const client = await this.minioService.getClient();
    const stream = await client.getObject(media.bucket, media.objectName);

    return {
      stream,
      contentType: getMediaContentType(media.type),
      filename: media.filename,
    };
  }

  /**
   * Streams a media file without ownership check.
   * Use ONLY after verifying access via a grant or equivalent authorization.
   */
  public async getStreamGranted(mediaId: string): Promise<MediaStreamResult> {
    const media = await this.repository.findById(mediaId);

    acceptFalseThrows(
      media !== null,
      () => new NotFoundException(this.MEDIA_NOT_FOUND),
    );

    const client = await this.minioService.getClient();
    const stream = await client.getObject(media.bucket, media.objectName);

    return {
      stream,
      contentType: getMediaContentType(media.type),
      filename: media.filename,
    };
  }

  public async getTempFileStream(
    mediaId: string,
    ownerUserId: string,
  ): Promise<MediaStreamResult> {
    const media = await this.repository.findByIdAndOwnerId(
      mediaId,
      ownerUserId,
    );

    acceptFalseThrows(
      media !== null,
      () => new NotFoundException(this.MEDIA_NOT_FOUND),
    );

    acceptFalseThrows(
      media.bucket === MinioBuckets.TEMP,
      () =>
        new ForbiddenException(
          'Apenas arquivos temporários podem ser acessados',
        ),
    );

    const client = await this.minioService.getClient();
    const stream = await client.getObject(media.bucket, media.objectName);

    return {
      stream,
      contentType: getMediaContentType(media.type),
      filename: media.filename,
    };
  }

  public async downloadGranted(mediaIds: string[]): Promise<MediaStreamResult> {
    if (mediaIds.length === 1) {
      return this.getStreamGranted(mediaIds[0]);
    }
    return this.generateZipGranted(mediaIds);
  }

  public async downloadMany(
    mediaIds: string[],
    ownerUserId: string,
  ): Promise<MediaStreamResult> {
    if (mediaIds.length === 1) {
      return this.getStream(mediaIds[0], ownerUserId);
    }

    await this.validateOwnership(mediaIds, ownerUserId);

    return this.generateZip(mediaIds, ownerUserId);
  }

  public async updateMedia(
    id: string,
    file: Express.Multer.File,
    ownerUserId: string,
  ): Promise<MediaDto> {
    acceptFalseThrows(
      isAllowedMimeType(file.mimetype),
      () => new BadRequestException(this.MEDIA_TYPE_NOT_SUPPORTED),
    );

    const existingMedia = await this.repository.findByIdAndOwnerId(
      id,
      ownerUserId,
    );

    acceptFalseThrows(
      existingMedia !== null,
      () => new NotFoundException(this.MEDIA_NOT_FOUND),
    );

    this.validateFileType(file);

    await this.removeFromMinio(existingMedia.bucket, existingMedia.objectName);

    const objectName = this.generateObjectName(file);
    const bucket = MinioBuckets.TEMP;

    const {
      media: updatedMedia,
      buffer: updatedBuffer,
      contentType: updatedContentType,
    } = await this.mapper.fromFile(
      file,
      bucket,
      objectName,
      existingMedia.ownerUserId,
    );

    await this.uploadToMinio(
      bucket,
      objectName,
      updatedBuffer,
      updatedContentType,
    );

    updatedMedia.id = id;

    const savedMedia = await this.repository.save(updatedMedia);

    return this.mapper.toDto(savedMedia);
  }

  public async deleteByIdAndOwnerId(
    id: string,
    ownerUserId: string,
  ): Promise<void> {
    const media = await this.repository.findByIdAndOwnerId(id, ownerUserId);

    acceptFalseThrows(
      media !== null,
      () => new NotFoundException(this.MEDIA_NOT_FOUND),
    );

    await this.removeFromMinio(media.bucket, media.objectName);
    await this.repository.delete(id);
  }

  public async persistMedia(
    mediaId: string,
    userId: string,
    targetBucket: string,
  ): Promise<MediaDto> {
    const media = await this.repository.findByIdAndOwnerId(mediaId, userId);

    acceptFalseThrows(
      media !== null,
      () => new NotFoundException(this.MEDIA_NOT_FOUND),
    );

    if (media.bucket !== MinioBuckets.TEMP) {
      throw new BadRequestException('Mídia não está no bucket temporário');
    }

    await this.copyObjectBetweenBuckets(
      media.bucket,
      media.objectName,
      targetBucket,
      media.objectName,
    );

    const sourceBucket = media.bucket;
    media.bucket = targetBucket;

    const updatedMedia = await this.repository.save(media);

    await this.removeFromMinio(sourceBucket, media.objectName);

    return this.mapper.toDto(updatedMedia);
  }

  @Cron(CronExpression.EVERY_HOUR)
  public async cleanupTempFiles(): Promise<void> {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const tempMedias = await this.repository.findTempMediasOlderThan(oneDayAgo);

    for (const media of tempMedias) {
      try {
        await this.removeFromMinio(media.bucket, media.objectName);
        await this.repository.delete(media.id);
      } catch (error) {
        this.logger.error(
          `Erro ao remover arquivo temporário ${media.objectName}`,
          error,
        );
      }
    }
  }

  private async uploadToMinio(
    bucket: string,
    objectName: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<void> {
    const client = await this.minioService.getClient();
    await client.putObject(bucket, objectName, buffer, buffer.length, {
      'Content-Type': contentType,
    });
  }

  private async removeFromMinio(
    bucket: string,
    objectName: string,
  ): Promise<void> {
    const client = await this.minioService.getClient();
    await client.removeObject(bucket, objectName);
  }

  private async copyObjectBetweenBuckets(
    sourceBucket: string,
    sourceObject: string,
    targetBucket: string,
    targetObject: string,
  ): Promise<void> {
    const client = await this.minioService.getClient();
    await client.copyObject(
      targetBucket,
      targetObject,
      `${sourceBucket}/${sourceObject}`,
    );
  }

  private generateObjectName(file: Express.Multer.File): string {
    const uniqueId = randomUUID();
    const fileExtension = path.extname(file.originalname);
    return `${uniqueId}${fileExtension}`;
  }

  private validateFileType(file: Express.Multer.File): void {
    Optional.ofNullable(file)
      .map((f) => f.originalname)
      .map(extractFileTypeFromOriginalName)
      .map((type) => type?.toUpperCase())
      .map((type) => MediaType[type])
      .orElseThrow(
        () => new BadRequestException(this.MEDIA_TYPE_NOT_SUPPORTED),
      );
  }

  private async generateZip(mediaIds: string[], ownerUserId: string) {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = new PassThrough();

    archive.pipe(stream);

    for (const mediaId of mediaIds) {
      const media = await this.repository.findByIdAndOwnerId(
        mediaId,
        ownerUserId,
      );

      const client = await this.minioService.getClient();
      const fileStream = await client.getObject(media.bucket, media.objectName);

      archive.append(fileStream, { name: media.filename });
    }

    archive.finalize();

    return {
      stream,
      contentType: 'application/zip',
      filename: 'documentos.zip',
    };
  }

  private async generateZipGranted(mediaIds: string[]) {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = new PassThrough();

    archive.pipe(stream);

    for (const mediaId of mediaIds) {
      const media = await this.repository.findById(mediaId);

      const client = await this.minioService.getClient();
      const fileStream = await client.getObject(media.bucket, media.objectName);

      archive.append(fileStream, { name: media.filename });
    }

    archive.finalize();

    return {
      stream,
      contentType: 'application/zip',
      filename: 'documentos.zip',
    };
  }
}
