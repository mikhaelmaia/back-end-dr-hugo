import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaRepository } from './media.repository';
import { MediaMapper } from './media.mapper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from './entities/media.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { MinioModule } from './minio/minio.module';

@Module({
  imports: [TypeOrmModule.forFeature([Media]), ScheduleModule.forRoot(), MinioModule],
  providers: [MediaService, MediaRepository, MediaMapper],
  exports: [MediaService],
})
export class MediaModule {}
