import { Inject, Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import redisConfig from '../../../config/cache/redis.config';
import { RedisClient } from './redis.client';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);

  public constructor(
    @Inject(redisConfig.KEY)
    config: ConfigType<typeof redisConfig>,
  ) {
    this.client = RedisClient.create({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db,
    });
  }

  public getClient(): Redis {
    return this.client;
  }

  public async ping(): Promise<string> {
    return this.client.ping();
  }

  public async onModuleDestroy(): Promise<void> {
    try {
      await this.client.quit();
      this.logger.log('Conexão Redis encerrada com sucesso');
    } catch (error) {
      this.logger.error('Erro ao encerrar conexão Redis', error);
    }
  }
}
