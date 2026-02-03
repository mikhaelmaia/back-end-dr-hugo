import { Injectable, Logger, Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { RedisService } from './redis/redis.service';
import redisConfig from '../../config/cache/redis.config';

export const CACHE_SERVICE = Symbol('CACHE_SERVICE');

export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  expire(key: string, ttl: number): Promise<boolean>;
  flushAll(): Promise<void>;
}

@Injectable()
export class CacheService implements ICacheService {
  private readonly logger = new Logger(CacheService.name);

  public constructor(
    private readonly redis: RedisService,
    @Inject(redisConfig.KEY)
    private readonly config: ConfigType<typeof redisConfig>,
  ) {}

  public async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.getClient().get(key);
      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Erro ao buscar chave '${key}' no cache`, error);
      return null;
    }
  }

  public async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      const cacheTime = ttl ?? this.config.ttl;

      await this.redis.getClient().set(key, serializedValue, 'EX', cacheTime);
    } catch (error) {
      this.logger.error(`Erro ao definir chave '${key}' no cache`, error);
      throw error;
    }
  }

  public async del(key: string): Promise<void> {
    try {
      await this.redis.getClient().del(key);
    } catch (error) {
      this.logger.error(`Erro ao deletar chave '${key}' do cache`, error);
      throw error;
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.getClient().exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(
        `Erro ao verificar existência da chave '${key}'`,
        error,
      );
      return false;
    }
  }

  public async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const result = await this.redis.getClient().expire(key, ttl);
      return result === 1;
    } catch (error) {
      this.logger.error(`Erro ao definir TTL para chave '${key}'`, error);
      return false;
    }
  }

  public async flushAll(): Promise<void> {
    try {
      await this.redis.getClient().flushall();
      this.logger.warn('Cache limpo completamente');
    } catch (error) {
      this.logger.error('Erro ao limpar o cache', error);
      throw error;
    }
  }
}
