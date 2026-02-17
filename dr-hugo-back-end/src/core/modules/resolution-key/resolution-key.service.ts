import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { CACHE_SERVICE, CacheService } from '../cache/cache.service';

@Injectable()
export class ResolutionKeyService {
  private readonly prefix = 'resolution:';

  constructor(
    @Inject(CACHE_SERVICE)
    private readonly cache: CacheService,
  ) {}

  public async create(payload: unknown, ttlSeconds: number): Promise<string> {
    const key = this.generateKey();

    await this.cache.set(this.prefix + key, payload, ttlSeconds);

    return key;
  }

  public async resolve<T = unknown>(key: string): Promise<T> {
    if (key?.length !== 64) {
      throw new BadRequestException('Chave inválida');
    }

    const cacheKey = this.prefix + key;

    const exists = await this.cache.exists(cacheKey);

    if (!exists) {
      throw new BadRequestException('Chave inválida ou expirada');
    }

    const data = await this.cache.get<T>(cacheKey);

    if (!data) {
      throw new BadRequestException('Chave inválida ou expirada');
    }

    await this.cache.del(cacheKey);

    return data;
  }

  private generateKey(): string {
    return randomBytes(32).toString('hex');
  }
}
