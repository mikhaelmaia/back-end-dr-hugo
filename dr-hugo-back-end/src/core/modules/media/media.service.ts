import { Media } from './entities/media.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { MediaRepository } from './media.repository';
import { MediaDto } from './dtos/media.dto';
import { MediaMapper } from './media.mapper';
import { BaseService } from '../../base/base.service';
import { MinioService } from './minio/minio.service';
import { MinioBuckets } from './minio/minio.buckets';
import { acceptFalseThrows } from '../../utils/functions';
import { Optional } from '../../utils/optional';
import { extractFileTypeFromOriginalName } from '../../utils/utils';
import { MediaType } from '../../vo/consts/enums';
import { Cron, CronExpression } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'node:path';

@Injectable()
export class MediaService extends BaseService<
  Media,
  MediaDto,
  MediaRepository,
  MediaMapper
> {
  private readonly logger = new Logger(MediaService.name);
  private readonly MEDIA_TYPE_NOT_SUPPORTED: string =
    'Tipo de mídia não suportado';
  private readonly MEDIA_NOT_FOUND: string = 'Mídia não encontrada';

  constructor(
    repository: MediaRepository,
    mapper: MediaMapper,
    private readonly minioService: MinioService,
  ) {
    super(repository, mapper);
  }

  public async createMedia(file: Express.Multer.File, bucket: MinioBuckets = MinioBuckets.TEMP): Promise<MediaDto> {
    this.validateFileType(file);

    const objectName = this.generateObjectName(file);

    await this.uploadToMinio(bucket, objectName, file.buffer, file.mimetype);

    const media = Media.from(file, bucket, objectName);
    const savedMedia = await this.repository.save(media);

    return this.mapper.toDto(savedMedia);
  }

  public async findById(id: string): Promise<MediaDto> {
    const media = await this.repository.findById(id);
    return Optional.ofNullable(media)
      .map((m) => this.mapper.toDto(m))
      .orElseThrow(() => new NotFoundException(this.MEDIA_NOT_FOUND));
  }

  public async update(
    id: string,
    file: Express.Multer.File,
  ): Promise<MediaDto> {
    const existingMedia = await this.repository.findById(id);
    acceptFalseThrows(
      existingMedia !== null,
      () => new NotFoundException(this.MEDIA_NOT_FOUND),
    );

    this.validateFileType(file);

    await this.removeFromMinio(existingMedia.bucket, existingMedia.objectName);

    const objectName = this.generateObjectName(file);
    const bucket = MinioBuckets.TEMP;

    await this.uploadToMinio(bucket, objectName, file.buffer, file.mimetype);

    const updatedMedia = Media.from(file, bucket, objectName);
    updatedMedia.id = id;
    const savedMedia = await this.repository.save(updatedMedia);

    return this.mapper.toDto(savedMedia);
  }

  public async deleteById(id: string): Promise<void> {
    const media = await this.repository.findById(id);
    acceptFalseThrows(
      media !== null,
      () => new NotFoundException(this.MEDIA_NOT_FOUND),
    );

    await this.removeFromMinio(media.bucket, media.objectName);

    await this.repository.delete(id);
  }

  public async persistMedia(
    mediaId: string,
    targetBucket: string,
  ): Promise<MediaDto> {
    const media = await this.repository.findById(mediaId);
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

    await this.removeFromMinio(media.bucket, media.objectName);

    media.bucket = targetBucket;
    const updatedMedia = await this.repository.save(media);

    return this.mapper.toDto(updatedMedia);
  }

  @Cron(CronExpression.EVERY_HOUR)
  public async cleanupTempFiles(): Promise<void> {
    try {
      this.logger.log('Iniciando limpeza de arquivos temporários...');

      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const tempMedias =
        await this.repository.findTempMediasOlderThan(oneDayAgo);

      for (const media of tempMedias) {
        try {
          await this.removeFromMinio(media.bucket, media.objectName);

          await this.repository.delete(media.id);

          this.logger.log(`Arquivo temporário removido: ${media.objectName}`);
        } catch (error) {
          this.logger.error(
            `Erro ao remover arquivo temporário ${media.objectName}:`,
            error,
          );
        }
      }

      this.logger.log(
        `Limpeza concluída. ${tempMedias.length} arquivos removidos.`,
      );
    } catch (error) {
      this.logger.error('Erro durante limpeza de arquivos temporários:', error);
    }
  }

  private async uploadToMinio(
    bucket: string,
    objectName: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<void> {
    const client = this.minioService.getClient();
    await client.putObject(bucket, objectName, buffer, buffer.length, {
      'Content-Type': contentType,
    });
  }

  private async removeFromMinio(
    bucket: string,
    objectName: string,
  ): Promise<void> {
    const client = this.minioService.getClient();
    try {
      await client.removeObject(bucket, objectName);
    } catch (error) {
      this.logger.warn(
        `Erro ao remover objeto do MinIO: ${bucket}/${objectName}`,
        error,
      );
    }
  }

  private async copyObjectBetweenBuckets(
    sourceBucket: string,
    sourceObject: string,
    targetBucket: string,
    targetObject: string,
  ): Promise<void> {
    const client = this.minioService.getClient();
    await client.copyObject(
      targetBucket,
      targetObject,
      `${sourceBucket}/${sourceObject}`,
    );
  }

  private generateObjectName(file: Express.Multer.File): string {
    const uniqueId = uuidv4();
    const fileExtension = path.extname(file.originalname);
    return `${uniqueId}${fileExtension}`;
  }

  private validateFileType(file: Express.Multer.File): void {
    Optional.ofNullable(file)
      .map((f) => f.originalname)
      .map(extractFileTypeFromOriginalName)
      .map((type) => type.toUpperCase())
      .map((type) => MediaType[type])
      .orElseThrow(
        () => new BadRequestException(this.MEDIA_TYPE_NOT_SUPPORTED),
      );
  }
}
