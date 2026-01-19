import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { CacheService, CACHE_SERVICE } from './cache.service';
import redisConfig from '../../config/cache/redis.config';

@Module({
  imports: [RedisModule, ConfigModule.forFeature(redisConfig)],
  providers: [
    {
      provide: CACHE_SERVICE,
      useClass: CacheService,
    },
  ],
  exports: [CACHE_SERVICE, RedisModule],
})
export class CacheModule {}
