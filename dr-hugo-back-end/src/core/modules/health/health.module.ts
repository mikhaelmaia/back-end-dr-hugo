import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { MinioModule } from '../media/minio/minio.module';
import { RedisModule } from '../cache/redis/redis.module';

@Module({
    imports: [MinioModule, RedisModule],
    controllers: [HealthController],
    providers: [HealthService],
    exports: [HealthService]
})
export class HealthModule {}