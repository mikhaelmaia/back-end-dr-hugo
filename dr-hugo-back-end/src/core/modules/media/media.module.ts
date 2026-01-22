import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MediaRepository } from './media.repository';
import { MediaMapper } from './media.mapper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from './entities/media.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { MinioModule } from './minio/minio.module';

@Module({
  imports: [TypeOrmModule.forFeature([Media]), ScheduleModule.forRoot(), MinioModule],
  controllers: [MediaController],
  providers: [MediaService, MediaRepository, MediaMapper],
  exports: [MediaService, MinioModule],
})
export class MediaModule {}
